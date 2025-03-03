/**
 * JavaScript Optimisation Script
 * 
 * This is a supplementary script for the npm optimise-js command.
 * It provides additional functionality like file size reporting.
 * 
 * The actual minification is handled by uglify-js via the npm script.
 */

const fs = require('fs');
const path = require('path');

// File paths
const jsDir = path.join(__dirname, '..', 'js');
const sourcesJsFiles = [
  path.join(jsDir, 'jquery.min.js'),
  path.join(jsDir, 'bootstrap.min.js'),
  path.join(jsDir, 'plugins.min.js'),
  path.join(jsDir, 'jquery.flexslider-min.js'),
  path.join(jsDir, 'touchTouch.jquery.js')
];
const combinedJsPath = path.join(jsDir, 'all.min.js');

// Function to wait for a file to exist
function waitForFile(filePath, timeout = 2000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (fs.existsSync(filePath)) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for file: ${filePath}`));
      }
    }, 100);
  });
}

// Function to get file size in KB
function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

// Main function
async function main() {
  try {
    // Check if source files exist
    let totalOriginalSize = 0;
    const fileSizes = {};
    
    for (const file of sourcesJsFiles) {
      if (!fs.existsSync(file)) {
        console.warn(`Warning: ${file} not found, skipping.`);
        continue;
      }
      
      const size = parseFloat(getFileSizeInKB(file));
      fileSizes[path.basename(file)] = size;
      totalOriginalSize += size;
    }
    
    if (Object.keys(fileSizes).length === 0) {
      console.error("Error: No source JavaScript files found!");
      process.exit(1);
    }

    // Wait for the all.min.js file to be created by uglify-js
    await waitForFile(combinedJsPath);

    // Get file size of the combined file
    const combinedSize = getFileSizeInKB(combinedJsPath);

    // Print report
    console.log("\n✅ JavaScript optimisation completed successfully!");
    console.log("📊 Optimisation Report:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // List individual file sizes
    Object.entries(fileSizes).forEach(([filename, size]) => {
      console.log(`📁 ${filename}: ${size} KB`);
    });
    
    console.log(`📁 Total original size: ${totalOriginalSize.toFixed(2)} KB`);
    console.log(`📁 all.min.js: ${combinedSize} KB`);
    console.log(`🔻 Size reduction: ${(100 - (combinedSize / totalOriginalSize * 100)).toFixed(2)}%`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 Next Steps:");
    console.log("1. Update your HTML to reference the all.min.js file");
    console.log('   <script src="js/all.min.js"></script>');
    console.log("2. Keep any external dependencies separate (like emailjs)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
