/**
 * Image Optimisation and S3 Upload Script
 * 
 * This script:
 * 1. Optimises all images in the img/ directory
 * 2. Converts them to WebP format
 * 3. Uploads both original and WebP versions to AWS S3
 * 
 * Requirements:
 * - sharp: For image processing and WebP conversion
 * - aws-sdk: For S3 uploads
 * - glob: For finding image files
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { S3 } = require('@aws-sdk/client-s3');
const glob = require('glob');

// S3 Configuration - Using environment variables
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
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

// Image optimisation settings
const JPEG_OPTIONS = { quality: 80 };
const PNG_OPTIONS = { 
  quality: 80,
  compressionLevel: 9,
  palette: true
};
const WEBP_OPTIONS = { quality: 80 };

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
 * Optimise an image and convert to WebP
 * 
 * @param {string} imagePath Path to the original image
 * @returns {Promise<Object>} Paths to optimised and WebP versions
 */
async function processImage(imagePath) {
  try {
    const filename = path.basename(imagePath);
    const extension = path.extname(imagePath).toLowerCase();
    const baseName = path.basename(imagePath, extension);
    
    // Define output paths
    const optimisedPath = path.join(OPTIMISED_DIR, filename);
    const webpPath = path.join(WEBP_DIR, `${baseName}.webp`);
    
    // Get original file size
    const originalStats = fs.statSync(imagePath);
    stats.originalSize += originalStats.size;
    
    // Process based on file type
    let sharpInstance = sharp(imagePath);
    
    if (extension === '.jpg' || extension === '.jpeg') {
      await sharpInstance.jpeg(JPEG_OPTIONS).toFile(optimisedPath);
    } else if (extension === '.png') {
      await sharpInstance.png(PNG_OPTIONS).toFile(optimisedPath);
    } else {
      // Just copy other file types
      fs.copyFileSync(imagePath, optimisedPath);
    }
    
    // Convert to WebP
    await sharp(imagePath).webp(WEBP_OPTIONS).toFile(webpPath);
    
    // Track sizes
    const optimisedStats = fs.statSync(optimisedPath);
    const webpStats = fs.statSync(webpPath);
    stats.optimisedSize += optimisedStats.size;
    stats.webpSize += webpStats.size;
    
    stats.optimised++;
    stats.webpConverted++;
    
    return { 
      original: imagePath,
      optimised: optimisedPath,
      webp: webpPath 
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
    
    const result = await s3.putObject(params);
    stats.uploaded++;
    return result;
  } catch (error) {
    console.error(`Error uploading ${filePath} to S3:`, error.message);
    stats.errors++;
    return null;
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
    
    // Find all images
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
        const processedPaths = await processImage(imagePath);
        
        if (!processedPaths) return;
        
        // Determine S3 paths
        const relativePath = path.relative(IMAGE_DIR, imagePath);
        const optimisedRelativePath = `optimised/${relativePath}`;
        const webpRelativePath = `webp/${path.basename(imagePath, path.extname(imagePath))}.webp`;
        
        // Upload to S3
        await uploadToS3(processedPaths.optimised, optimisedRelativePath);
        await uploadToS3(processedPaths.webp, webpRelativePath);
        
        // Log progress
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
      <source srcset="img/webp/example.webp" type="image/webp">
      <img src="img/optimised/example.jpg" alt="Example image">
    </picture>
    `);
    console.log('3. Your images are available at:');
    console.log(`   - Original: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/original/{filename}`);
    console.log(`   - Optimised: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/optimised/{filename}`);
    console.log(`   - WebP: https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/webp/{filename}.webp`);
    
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
