/**
 * Image Optimisation and S3 Upload Script
 * 
 * This script:
 * 1. Finds all images in the img directory
 * 2. Optimises them (reduces file size while maintaining quality)
 * 3. Converts them to WebP format
 * 4. Uploads both original and WebP versions to S3
 * 5. Generates a report of the process
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const sharp = require('sharp');
const AWS = require('aws-sdk');
const chalk = require('chalk');

// Configuration
const config = {
  sourceDir: path.join(__dirname, '..', 'img'),
  tempDir: path.join(__dirname, '..', 'img', '.tmp'),
  s3Bucket: process.env.AWS_BUCKET,
  s3Region: process.env.AWS_REGION,
  s3Prefix: 'images/', // The folder in S3 where images will be stored
  imageQuality: 85, // 0-100, higher is better quality but larger file size
  webpQuality: 80, // 0-100, WebP quality setting
  skipExisting: true, // Skip images that already exist in S3
  dryRun: false // If true, doesn't actually upload to S3
};

// Initialize AWS S3
const s3 = new AWS.S3({
  region: config.s3Region,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Ensure temp directory exists
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

// Statistics
const stats = {
  totalImages: 0,
  processed: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  optimisedSize: 0,
  webpSize: 0,
  uploadedOriginal: 0,
  uploadedWebP: 0
};

/**
 * Get file size in KB
 */
function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Check if file exists in S3
 */
async function checkFileExistsInS3(key) {
  try {
    if (!config.skipExisting) return false;
    
    await s3.headObject({
      Bucket: config.s3Bucket,
      Key: key
    }).promise();
    return true;
  } catch (err) {
    if (err.code === 'NotFound') {
      return false;
    }
    throw err;
  }
}

/**
 * Upload file to S3
 */
async function uploadToS3(filePath, key, contentType) {
  if (config.dryRun) {
    console.log(chalk.yellow(`[DRY RUN] Would upload: ${key}`));
    return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key}`;
  }

  const fileContent = fs.readFileSync(filePath);
  
  await s3.putObject({
    Bucket: config.s3Bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: 'max-age=31536000' // Cache for 1 year
  }).promise();
  
  return `https://${config.s3Bucket}.s3.${config.s3Region}.amazonaws.com/${key}`;
}

/**
 * Process a single image
 */
async function processImage(imagePath) {
  try {
    const filename = path.basename(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const nameWithoutExt = path.basename(imagePath, ext);
    
    // Skip non-image files
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return;
    }
    
    console.log(chalk.cyan(`Processing: ${filename}`));
    stats.totalImages++;
    
    // Original image info
    const originalSize = getFileSizeInKB(imagePath);
    stats.originalSize += parseFloat(originalSize);
    
    // Create paths for optimised files
    const optimisedPath = path.join(config.tempDir, filename);
    const webpPath = path.join(config.tempDir, `${nameWithoutExt}.webp`);
    
    // S3 paths
    const s3OriginalKey = `${config.s3Prefix}${filename}`;
    const s3WebpKey = `${config.s3Prefix}${nameWithoutExt}.webp`;
    
    // Check if files already exist in S3
    const originalExistsInS3 = await checkFileExistsInS3(s3OriginalKey);
    const webpExistsInS3 = await checkFileExistsInS3(s3WebpKey);
    
    if (originalExistsInS3 && webpExistsInS3) {
      console.log(chalk.yellow(`Skipping: ${filename} (already exists in S3)`));
      stats.skipped++;
      return;
    }
    
    // Optimise original image
    await sharp(imagePath)
      .jpeg({ quality: config.imageQuality, mozjpeg: true })
      .png({ quality: config.imageQuality })
      .toFile(optimisedPath);
    
    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: config.webpQuality })
      .toFile(webpPath);
    
    // Get optimised file sizes
    const optimisedSize = getFileSizeInKB(optimisedPath);
    const webpSize = getFileSizeInKB(webpPath);
    stats.optimisedSize += parseFloat(optimisedSize);
    stats.webpSize += parseFloat(webpSize);
    
    // Upload to S3
    if (!originalExistsInS3) {
      const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        ext === '.png' ? 'image/png' : 
                        ext === '.gif' ? 'image/gif' : 'application/octet-stream';
      
      await uploadToS3(optimisedPath, s3OriginalKey, contentType);
      stats.uploadedOriginal++;
    }
    
    if (!webpExistsInS3) {
      await uploadToS3(webpPath, s3WebpKey, 'image/webp');
      stats.uploadedWebP++;
    }
    
    console.log(chalk.green(`✓ Optimised: ${filename}`));
    console.log(`  Original: ${originalSize} KB → Optimised: ${optimisedSize} KB → WebP: ${webpSize} KB`);
    console.log(`  Reduction: ${((1 - parseFloat(webpSize) / parseFloat(originalSize)) * 100).toFixed(2)}%`);
    
    stats.processed++;
  } catch (err) {
    console.error(chalk.red(`Error processing ${imagePath}: ${err.message}`));
    stats.errors++;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(chalk.blue.bold('\n🖼️  Image Optimisation and S3 Upload\n'));
    
    // Validate environment variables
    if (!process.env.AWS_BUCKET || !process.env.AWS_REGION || 
        !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error(chalk.red('Missing required environment variables. Make sure AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set.'));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`Source directory: ${config.sourceDir}`));
    console.log(chalk.cyan(`S3 Bucket: ${config.s3Bucket} (${config.s3Region})`));
    console.log(chalk.cyan(`S3 Prefix: ${config.s3Prefix}`));
    
    if (config.dryRun) {
      console.log(chalk.yellow('DRY RUN MODE: No files will be uploaded to S3'));
    }
    
    // Find all images
    const imageFiles = await glob(path.join(config.sourceDir, '**/*.{jpg,jpeg,png,gif}'));
    
    if (imageFiles.length === 0) {
      console.log(chalk.yellow('No image files found in the source directory.'));
      return;
    }
    
    console.log(chalk.blue(`Found ${imageFiles.length} image files to process.`));
    
    // Process images
    for (const imagePath of imageFiles) {
      await processImage(imagePath);
    }
    
    // Print summary
    console.log(chalk.blue.bold('\n📊 Summary\n'));
    console.log(`Total images found: ${stats.totalImages}`);
    console.log(`Successfully processed: ${stats.processed}`);
    console.log(`Skipped (already in S3): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    console.log('\nSize comparison:');
    console.log(`Original: ${stats.originalSize.toFixed(2)} KB`);
    console.log(`Optimised: ${stats.optimisedSize.toFixed(2)} KB (${((1 - stats.optimisedSize / stats.originalSize) * 100).toFixed(2)}% reduction)`);
    console.log(`WebP: ${stats.webpSize.toFixed(2)} KB (${((1 - stats.webpSize / stats.originalSize) * 100).toFixed(2)}% reduction)`);
    console.log('\nFiles uploaded to S3:');
    console.log(`Original format: ${stats.uploadedOriginal}`);
    console.log(`WebP format: ${stats.uploadedWebP}`);
    
    // Clean up temp directory
    fs.rmdirSync(config.tempDir, { recursive: true });
    console.log(chalk.green.bold('\n✅ Image optimisation completed!\n'));
    
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  }
}

// Run the script
main();
