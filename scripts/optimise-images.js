/**
 * Image Optimisation and S3 Upload Script (Compatible with older Node.js)
 * 
 * This script:
 * 1. Optimises all images in the img/ directory
 * 2. Converts them to WebP format
 * 3. Uploads both original and WebP versions to AWS S3
 * 4. Maintains the original folder structure
 */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const glob = require('glob');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const mkdirp = require('mkdirp');

// S3 Configuration - Using environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const S3_BUCKET = process.env.AWS_BUCKET;
const IMAGE_DIR = path.join(__dirname, '..', 'img');
const OPTIMISED_DIR = path.join(__dirname, '..', 'img-optimised');
const WEBP_DIR = path.join(__dirname, '..', 'img-webp');

// Ensure output directories exist
if (!fs.existsSync(OPTIMISED_DIR)) {
  fs.mkdirSync(OPTIMISED_DIR, { recursive: true });
}

if (!fs.existsSync(WEBP_DIR)) {
  fs.mkdirSync(WEBP_DIR, { recursive: true });
}

// Track statistics
const stats = {
  total: 0,
  optimised: 0,
  webpConverted: 0,
  uploaded: 0,
  originalSize: 0,
  optimisedSize: 0,
  webpSize: 0,
  errors: 0
};

/**
 * Process a single image file
 * 
 * @param {string} imagePath Path to the original image
 * @returns {Promise<Object>} Processing result
 */
async function processImage(imagePath) {
  try {
    // Get relative path to maintain folder structure
    const relativePath = path.relative(IMAGE_DIR, imagePath);
    const dirName = path.dirname(relativePath);
    const baseName = path.basename(imagePath);
    const extension = path.extname(imagePath).toLowerCase();
    const baseNameWithoutExt = path.basename(baseName, extension);
    
    // Create directories for optimised and WebP versions
    const optimisedDir = path.join(OPTIMISED_DIR, dirName === '.' ? '' : dirName);
    const webpDir = path.join(WEBP_DIR, dirName === '.' ? '' : dirName);
    
    if (!fs.existsSync(optimisedDir)) {
      mkdirp.sync(optimisedDir);
    }
    
    if (!fs.existsSync(webpDir)) {
      mkdirp.sync(webpDir);
    }
    
    // Define output paths
    const optimisedPath = path.join(optimisedDir, baseName);
    const webpPath = path.join(webpDir, `${baseNameWithoutExt}.webp`);
    
    // Get original file size
    const originalStats = fs.statSync(imagePath);
    stats.originalSize += originalStats.size;
    
    // Optimise the image
    const optimisedResult = await imagemin([imagePath], {
      destination: optimisedDir,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        })
      ]
    });
    
    // Convert to WebP
    const webpResult = await imagemin([imagePath], {
      destination: webpDir,
      plugins: [
        imageminWebp({
          quality: 75
        })
      ]
    });
    
    // For WebP, we need to rename the file to have .webp extension
    if (webpResult && webpResult.length > 0) {
      const webpOutput = webpResult[0].destinationPath;
      const webpOutputDir = path.dirname(webpOutput);
      const webpOutputBase = path.basename(webpOutput, path.extname(webpOutput));
      const newWebpPath = path.join(webpOutputDir, `${webpOutputBase}.webp`);
      
      // Rename if needed
      if (webpOutput !== newWebpPath && fs.existsSync(webpOutput)) {
        fs.renameSync(webpOutput, newWebpPath);
      }
    }
    
    // Get optimised and WebP file sizes
    if (fs.existsSync(optimisedPath)) {
      const optimisedStats = fs.statSync(optimisedPath);
      stats.optimisedSize += optimisedStats.size;
      stats.optimised++;
    }
    
    if (fs.existsSync(webpPath)) {
      const webpStats = fs.statSync(webpPath);
      stats.webpSize += webpStats.size;
      stats.webpConverted++;
    }
    
    // Define S3 keys with preserved directory structure
    // For root directory files, don't add a leading directory separator
    const optimisedS3Key = `optimised/${relativePath}`;
    
    // For WebP, use the correct path without './' prefix for root files
    let webpS3Key;
    if (dirName === '.') {
      webpS3Key = `webp/${baseNameWithoutExt}.webp`;
    } else {
      webpS3Key = `webp/${dirName}/${baseNameWithoutExt}.webp`;
    }
    
    return {
      original: imagePath,
      optimised: optimisedPath,
      webp: webpPath,
      optimisedS3Key: optimisedS3Key,
      webpS3Key: webpS3Key
    };
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error.message);
    stats.errors++;
    return null;
  }
}

/**
 * Upload a file to S3
 * 
 * @param {string} filePath Local file path
 * @param {string} s3Key S3 destination key
 * @returns {Promise<Object>} S3 upload result
 */
async function uploadToS3(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(filePath);
    
    const params = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'max-age=31536000' // 1 year caching
    };
    
    return new Promise((resolve, reject) => {
      s3.putObject(params, (err, data) => {
        if (err) {
          console.error(`Error uploading ${filePath} to S3:`, err.message);
          stats.errors++;
          reject(err);
        } else {
          stats.uploaded++;
          resolve(data);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    stats.errors++;
    throw error;
  }
}

/**
 * Get the MIME type based on file extension
 * 
 * @param {string} filePath Path to file
 * @returns {string} MIME type
 */
function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Format bytes to a human-readable string
 * 
 * @param {number} bytes Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main function to process all images and upload to S3
 */
async function main() {
  try {
    console.log('🖼️  Starting image optimisation and S3 upload...');
    
    // Check if environment variables are set
    if (!process.env.AWS_BUCKET || !process.env.AWS_REGION || 
        !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ Missing AWS environment variables. Make sure AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set.');
      process.exit(1);
    }
    
    // Find all images, including those in subdirectories
    const imagePatterns = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif'];
    let imagePaths = [];
    
    for (const pattern of imagePatterns) {
      const matches = glob.sync(pattern, { cwd: IMAGE_DIR, absolute: true });
      imagePaths = [...imagePaths, ...matches];
    }
    
    stats.total = imagePaths.length;
    
    if (stats.total === 0) {
      console.log('⚠️  No images found in the img/ directory.');
      return;
    }
    
    console.log(`🔍 Found ${stats.total} images to process`);
    
    // Process images in batches to avoid memory issues
    const BATCH_SIZE = 5;
    for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
      const batch = imagePaths.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (imagePath) => {
        // Process image
        const result = await processImage(imagePath);
        
        if (!result) return;
        
        // Upload to S3
        if (fs.existsSync(result.optimised)) {
          await uploadToS3(result.optimised, result.optimisedS3Key);
        }
        
        if (fs.existsSync(result.webp)) {
          await uploadToS3(result.webp, result.webpS3Key);
        }
        
        // Log progress
        const relativePath = path.relative(IMAGE_DIR, imagePath);
        console.log(`✅ Processed and uploaded: ${relativePath}`);
      });
      
      await Promise.all(promises);
      console.log(`📊 Progress: ${Math.min(i + BATCH_SIZE, imagePaths.length)}/${imagePaths.length}`);
    }
    
    // Print summary
    console.log('\n📈 Optimisation Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🖼️  Total images processed: ${stats.total}`);
    console.log(`✅ Images optimised: ${stats.optimised}`);
    console.log(`🌐 WebP images created: ${stats.webpConverted}`);
    console.log(`☁️  Files uploaded to S3: ${stats.uploaded}`);
    console.log(`❌ Errors encountered: ${stats.errors}`);
    console.log('');
    console.log(`📦 Original size: ${formatBytes(stats.originalSize)}`);
    console.log(`📦 Optimised size: ${formatBytes(stats.optimisedSize)} (${Math.round((1 - stats.optimisedSize / stats.originalSize) * 100)}% reduction)`);
    console.log(`📦 WebP size: ${formatBytes(stats.webpSize)} (${Math.round((1 - stats.webpSize / stats.originalSize) * 100)}% reduction)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (stats.errors > 0) {
      console.log('⚠️  Some errors occurred during processing. Check the logs above for details.');
    }
    
    console.log('\n💡 Next steps:');
    console.log('1. Update your HTML to use the optimised images');
    console.log('2. Add WebP support with the <picture> element:');
    console.log(`
    <picture>
      <source srcset="https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/webp/example.webp" type="image/webp">
      <img src="https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/optimised/example.jpg" alt="Example image">
    </picture>
    `);
    console.log('3. Your images are available at:');
    console.log(`   - Optimised: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/optimised/{path/to/file.jpg}`);
    console.log(`   - WebP: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/webp/{path/to/file.webp}`);
    
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
