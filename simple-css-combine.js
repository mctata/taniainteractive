/**
 * Simple CSS Combiner
 * 
 * This script combines bootstrap.css and style.css into a single file.
 * It uses a simple approach that works on older Node.js versions.
 * 
 * After running this script, use an online minifier like https://cssminifier.com/
 * to minify the combined CSS file.
 */

const fs = require('fs');
const path = require('path');

// File paths
const bootstrapCssPath = path.join(__dirname, 'css', 'bootstrap.css');
const styleCssPath = path.join(__dirname, 'css', 'style.css');
const outputPath = path.join(__dirname, 'css', 'combined.css');

// Read the CSS files
const bootstrapCss = fs.readFileSync(bootstrapCssPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

// Combine the CSS files
const combinedCss = `/* 
 * Combined CSS for taniainteractive.co.uk
 * Bootstrap v2.1.1 (Customised) + Site Styles
 * Compiled on ${new Date().toISOString()}
 */
${bootstrapCss}
${styleCss}`;

// Write the combined CSS to the output file
fs.writeFileSync(outputPath, combinedCss);

// Calculate and display file sizes
const bootstrapSize = bootstrapCss.length;
const styleSize = styleCss.length;
const combinedSize = combinedCss.length;

console.log('CSS files combined successfully!');
console.log(`Original bootstrap.css size: ${(bootstrapSize / 1024).toFixed(2)} KB`);
console.log(`Original style.css size: ${(styleSize / 1024).toFixed(2)} KB`);
console.log(`Combined size: ${(combinedSize / 1024).toFixed(2)} KB`);
console.log(`Output file: ${outputPath}`);
console.log('\nNext steps:');
console.log('1. Go to https://cssminifier.com/');
console.log('2. Upload or paste the contents of the combined.css file');
console.log('3. Download or copy the minified CSS');
console.log('4. Save it as css/combined.min.css');
console.log('5. Update your HTML to use the new combined.min.css file');
