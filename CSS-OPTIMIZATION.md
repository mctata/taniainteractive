# CSS Optimization Guide

This document describes how to use the CSS optimization tools to combine, optimize, and minify the CSS files for the taniainteractive website.

## What This Does

The optimization process:

1. Combines `bootstrap.css` and `style.css` into a single file
2. Merges duplicate CSS rules
3. Adds vendor prefixes automatically (for better browser compatibility)
4. Minifies the CSS by removing whitespace, comments, and optimizing values
5. Outputs a single `combined.min.css` file that is significantly smaller in size

## Benefits

- **Faster Page Load**: Fewer HTTP requests and smaller file size
- **Better Performance**: Streamlined CSS with optimized rules
- **Easier Maintenance**: One file to manage instead of multiple
- **Better Browser Compatibility**: Automatic vendor prefixing

## How to Use

### Prerequisites

- Node.js and npm installed on your computer
- Access to the command line/terminal

### One-Time Setup

1. Clone the repository to your local machine
2. Open a terminal/command prompt and navigate to the project directory
3. Run the following command to install the required dependencies:

```bash
npm install
```

This will install all the required packages defined in `package.json`.

### Running the Optimization

Whenever you make changes to `bootstrap.css` or `style.css`, you should run the optimization process:

```bash
npm run optimize-css
```

Or alternatively:

```bash
node optimize-css.js
```

### Output

After running the script, you'll see:
- A new file called `combined.min.css` in the `css` directory
- Console output showing the size reduction statistics

### Updating the HTML

Once you've generated the `combined.min.css` file, you should update your HTML files to use it instead of the separate CSS files.

Replace:
```html
<link rel="stylesheet" href="css/bootstrap.css">
<link rel="stylesheet" href="css/style.css">
```

With:
```html
<link rel="stylesheet" href="css/combined.min.css">
```

## Maintaining the CSS

When making future CSS changes:

1. Always edit the original CSS files (`bootstrap.css` or `style.css`)
2. Run the optimization script after making changes
3. Test the website thoroughly to ensure styles are applied correctly
4. Commit both the original files and the minified result to version control

## Troubleshooting

If you encounter any issues:

- Make sure all dependencies are installed correctly (`npm install`)
- Check that both CSS files exist in the expected locations
- Verify that you have write permissions to the `css` directory
- Look for error messages in the console output

If specific CSS styles are missing or not working correctly after optimization, you may need to adjust the optimization settings in `optimize-css.js`.
