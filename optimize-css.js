/**
 * CSS Optimization and Minification Script
 * 
 * This script combines, optimizes, and minifies CSS files for the taniainteractive website.
 * It takes bootstrap.css and style.css, combines them, optimizes the result, and outputs
 * a single minified file.
 * 
 * Requirements:
 * - Node.js
 * - npm packages: postcss, postcss-cli, cssnano, autoprefixer, postcss-merge-rules
 * 
 * Install dependencies with:
 * npm install postcss postcss-cli cssnano autoprefixer postcss-merge-rules --save-dev
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const mergeRules = require('postcss-merge-rules');

// File paths
const bootstrapCssPath = path.join(__dirname, 'css', 'bootstrap.css');
const styleCssPath = path.join(__dirname, 'css', 'style.css');
const outputPath = path.join(__dirname, 'css', 'combined.min.css');

// Read the CSS files
const bootstrapCss = fs.readFileSync(bootstrapCssPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

// Combine the CSS files
// Add a comment to indicate the source and version
const combinedCss = `/* 
 * Combined CSS for taniainteractive.co.uk
 * Bootstrap v2.1.1 (Customized) + Site Styles
 * Compiled on ${new Date().toISOString()}
 */
${bootstrapCss}
${styleCss}`;

// Configure PostCSS plugins
const plugins = [
  // Merge duplicate CSS rules
  mergeRules(),
  
  // Add vendor prefixes automatically
  autoprefixer({
    overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR', 'not dead']
  }),
  
  // Minify the CSS
  cssnano({
    preset: ['default', {
      discardComments: {
        removeAll: true
      },
      normalizeWhitespace: true,
      minifyFontValues: true,
      minifySelectors: true,
      mergeLonghand: true,
      colormin: true,
      reduceIdents: false // Preserve specific IDs
    }]
  })
];

// Process the combined CSS with PostCSS
postcss(plugins)
  .process(combinedCss, { from: undefined })
  .then(result => {
    // Write the processed CSS to the output file
    fs.writeFileSync(outputPath, result.css);
    console.log(`CSS files combined and minified successfully!`);
    console.log(`Original bootstrap.css size: ${(bootstrapCss.length / 1024).toFixed(2)} KB`);
    console.log(`Original style.css size: ${(styleCss.length / 1024).toFixed(2)} KB`);
    console.log(`Combined original size: ${((bootstrapCss.length + styleCss.length) / 1024).toFixed(2)} KB`);
    console.log(`Minified size: ${(result.css.length / 1024).toFixed(2)} KB`);
    console.log(`Reduction: ${(100 - (result.css.length / (bootstrapCss.length + styleCss.length) * 100)).toFixed(2)}%`);
  })
  .catch(error => {
    console.error('Error processing CSS:', error);
  });
