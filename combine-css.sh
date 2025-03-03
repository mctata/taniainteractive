#!/bin/bash
# Simple CSS combiner script for taniainteractive
# No dependencies required - just bash!

# File paths
BOOTSTRAP_CSS="css/bootstrap.css"
STYLE_CSS="css/style.css"
COMBINED_CSS="css/combined.css"

# Check if files exist
if [ ! -f "$BOOTSTRAP_CSS" ]; then
    echo "Error: $BOOTSTRAP_CSS not found!"
    exit 1
fi

if [ ! -f "$STYLE_CSS" ]; then
    echo "Error: $STYLE_CSS not found!"
    exit 1
fi

# Add header with timestamp
echo "/*" > "$COMBINED_CSS"
echo " * Combined CSS for taniainteractive.co.uk" >> "$COMBINED_CSS"
echo " * Bootstrap v2.1.1 (Customised) + Site Styles" >> "$COMBINED_CSS"
echo " * Compiled on $(date)" >> "$COMBINED_CSS"
echo " */" >> "$COMBINED_CSS"

# Combine the files
cat "$BOOTSTRAP_CSS" >> "$COMBINED_CSS"
cat "$STYLE_CSS" >> "$COMBINED_CSS"

# Calculate file sizes
BOOTSTRAP_SIZE=$(wc -c < "$BOOTSTRAP_CSS")
STYLE_SIZE=$(wc -c < "$STYLE_CSS")
COMBINED_SIZE=$(wc -c < "$COMBINED_CSS")

# Convert to KB
BOOTSTRAP_SIZE_KB=$(echo "scale=2; $BOOTSTRAP_SIZE/1024" | bc)
STYLE_SIZE_KB=$(echo "scale=2; $STYLE_SIZE/1024" | bc)
COMBINED_SIZE_KB=$(echo "scale=2; $COMBINED_SIZE/1024" | bc)

# Print results
echo "CSS files combined successfully!"
echo "Original bootstrap.css size: $BOOTSTRAP_SIZE_KB KB"
echo "Original style.css size: $STYLE_SIZE_KB KB"
echo "Combined size: $COMBINED_SIZE_KB KB"
echo "Output file: $COMBINED_CSS"
echo ""
echo "Next steps:"
echo "1. Go to https://cssminifier.com/"
echo "2. Upload or paste the contents of the combined.css file"
echo "3. Download or copy the minified CSS"
echo "4. Save it as css/combined.min.css"
echo "5. Update your HTML to use the new combined.min.css file"

# Make the script executable with: chmod +x combine-css.sh
# Run with: ./combine-css.sh
