/**
 * CSS Optimisation Script
 * 
 * This is a supplementary script for the npm optimise-css command.
 * It provides additional functionality like file size reporting.
 * 
 * The actual minification is handled by clean-css-cli via the npm script.
 */

const fs = require('fs');
const path = require('path');

// File paths
const bootstrapCssPath = path.join(__dirname, '..', 'css', 'bootstrap.css');
const styleCssPath = path.join(__dirname, '..', 'css', 'style.css');
const combinedMinCssPath = path.join(__dirname, '..', 'css', 'combined.min.css');

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
    if (!fs.existsSync(bootstrapCssPath)) {
      console.error(`Error: ${bootstrapCssPath} not found!`);
      process.exit(1);
    }

    if (!fs.existsSync(styleCssPath)) {
      console.error(`Error: ${styleCssPath} not found!`);
      process.exit(1);
    }

    // Wait for the combined.min.css file to be created by the clean-css-cli
    await waitForFile(combinedMinCssPath);

    // Get file sizes
    const bootstrapSize = getFileSizeInKB(bootstrapCssPath);
    const styleSize = getFileSizeInKB(styleCssPath);
    const combinedMinSize = getFileSizeInKB(combinedMinCssPath);
    const originalTotal = parseFloat(bootstrapSize) + parseFloat(styleSize);

    // Print report
    console.log("\n✅ CSS optimisation completed successfully!");
    console.log("📊 Optimisation Report:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📁 bootstrap.css: ${bootstrapSize} KB`);
    console.log(`📁 style.css: ${styleSize} KB`);
    console.log(`📁 Total original size: ${originalTotal.toFixed(2)} KB`);
    console.log(`📁 combined.min.css: ${combinedMinSize} KB`);
    console.log(`🔻 Size reduction: ${(100 - (combinedMinSize / originalTotal * 100)).toFixed(2)}%`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 Next Steps:");
    console.log("1. Update your HTML to reference the combined.min.css file");
    console.log('   <link rel="stylesheet" href="css/combined.min.css">');
    console.log("2. Deploy your optimised website");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the main function
main();
