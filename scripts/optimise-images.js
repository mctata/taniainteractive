/**
 * Image Optimisation and S3 Upload Script (Compatible with older Node.js)
 * 
 * This script:
 * 1. Optimises all images in the img/ directory
 * 2. Converts them to WebP format
 * 3. Uploads both original and WebP versions to AWS S3
 */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const glob = require('glob');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');

// S3 Configuration - Using environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const S3_BUCKET = process.env.AWS_BUCKET;
const IMAGE_DIR = path.join(__dirname, '..', 'img');
const WEBP_DIR = path.join(__dirname, '..', 'img', 'webp');
const OPTIMISED_DIR = path.join(__dirname, '..', 'img', 'optimised');

// Ensure output directories exist
if (!fs.existsSync(WEBP_DIR)) {
  fs.mkdirSync(WEBP_DIR, { recursive: true });
}

if (!fs.existsSync(OPTIMISED_DIR)) {
  fs.mkdirSync(OPTIMISED_DIR, { recursive: true });
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
 * Optimise images using imagemin
 * 
 * @param {string[]} imagePaths Array of image paths
 * @returns {Promise<object>} Result of optimisation
 */
async function optimiseImages(imagePaths) {
  try {
    // Optimise JPG and PNG
    const optimisedImages = await imagemin(imagePaths, {
      destination: OPTIMISED_DIR,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        })
      ]
    });
    
    stats.optimised += optimisedImages.length;
    
    // Convert to WebP
    const webpImages = await imagemin(imagePaths, {
      destination: WEBP_DIR,
      plugins: [
        imageminWebp({
          quality: 75
        })
      ]
    });
    
    stats.webpConverted += webpImages.length;
    
    return {
      optimised: optimisedImages,
      webp: webpImages
    };
  } catch (error) {
    console.error('Error optimising images:', error.message);
    stats.errors++;
    return {
      optimised: [],
      webp: []
    };
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
 * Get file size in bytes
 * 
 * @param {string} filePath Path to file
 * @returns {number} File size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Process all images in a directory
 * 
 * @param {string} directory Directory to process
 * @returns {Promise<void>}
 */
async function processDirectory(directory) {
  return new Promise((resolve, reject) => {
    glob('**/*.{jpg,jpeg,png,gif}', { cwd: directory, absolute: true }, async (err, files) => {
      if (err) {
        console.error('Error finding image files:', err.message);
        reject(err);
        return;
      }
      
      stats.total = files.length;
      
      if (files.length === 0) {
        console.log('⚠️  No images found in the img/ directory.');
        resolve();
        return;
      }
      
      console.log(`🔍 Found ${files.length} images to process`);
      
      // Calculate original sizes
      files.forEach(file => {
        stats.originalSize += getFileSize(file);
      });
      
      try {
        // Process images in batches to avoid memory issues
        const BATCH_SIZE = 5;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          
          // Optimise images
          const optimisationResult = await optimiseImages(batch);
          
          // Calculate optimised and webp sizes
          optimisationResult.optimised.forEach(file => {
            stats.optimisedSize += getFileSize(file.destinationPath);
          });
          
          optimisationResult.webp.forEach(file => {
            stats.webpSize += getFileSize(file.destinationPath);
            
            // Update file extension for WebP files (imagemin-webp doesn't do this automatically)
            const newPath = file.destinationPath.replace(/\.(jpe?g|png)$/, '.webp');
            if (file.destinationPath !== newPath) {
              fs.renameSync(file.destinationPath, newPath);
              file.destinationPath = newPath;
            }
          });
          
          // Upload to S3
          for (const file of optimisationResult.optimised) {
            const relativePath = path.relative(OPTIMISED_DIR, file.destinationPath);
            const s3Key = `optimised/${relativePath}`;
            await uploadToS3(file.destinationPath, s3Key);
          }
          
          for (const file of optimisationResult.webp) {
            const relativePath = path.relative(WEBP_DIR, file.destinationPath);
            const s3Key = `webp/${relativePath}`;
            await uploadToS3(file.destinationPath, s3Key);
          }
          
          console.log(`📊 Progress: ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}`);
        }
        
        resolve();
      } catch (error) {
        console.error('Error processing images:', error.message);
        reject(error);
      }
    });
  });
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
    
    await processDirectory(IMAGE_DIR);
    
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
      <source srcset="img/webp/example.webp" type="image/webp">
      <img src="img/optimised/example.jpg" alt="Example image">
    </picture>
    `);
    console.log('3. Your images are available at:');
    console.log(`   - Original: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/original/{filename}`);
    console.log(`   - Optimised: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/optimised/{filename}`);
    console.log(`   - WebP: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/webp/{filename}`);
    
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
