# 🌐 <code>taniainteractive</code>

A modern collection of interactive web development projects and experiments.

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-5C2D91?style=for-the-badge&logo=bootstrap&logoColor=white)

</div>

## 📋 About

This repository houses a diverse collection of interactive web projects and experiments. It serves as a central location for ongoing web development work, focusing on creating engaging user experiences through modern web technologies.

## 🔗 Repository Information

- **URL**: [github.com/mctata/taniainteractive](https://github.com/mctata/taniainteractive)
- **Type**: Private Repository
- **Owner**: mctata

## 💻 Technologies

- **Frontend**: HTML5, CSS3, JavaScript
- **Design**: Responsive layouts, Interactive elements
- **User Experience**: Animations, Transitions, Interactive UI

## 🏷️ Tags

`Web Development` `Interactive` `Frontend` `UI/UX` `JavaScript` `Creative Coding`

## 🚀 Getting Started

```bash
git clone https://github.com/mctata/taniainteractive.git
cd taniainteractive
npm install
```

## 📁 Project Structure

```
taniainteractive/
├── .gitignore        # Git ignore file
├── README.md         # This documentation
├── css/              # CSS files
├── js/               # JavaScript files
├── img/              # Original image files
└── scripts/          # Build and optimisation scripts
```

## 🔄 Contributing

For team members with access to this private repository:

1. Create a new branch for your feature
2. Implement your changes
3. Submit a pull request for review

## 📦 Asset Optimisation

This repository includes tools to optimise CSS, JavaScript, and images for better performance.

### CSS & JS Optimisation

```bash
# Optimise CSS files
npm run optimise-css

# Optimise JavaScript files
npm run optimise-js

# Optimise both CSS and JS
npm run optimise
```

After optimisation, update your HTML to reference the minified files:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/combined.min.css">

<!-- JavaScript -->
<script src="js/all.min.js"></script>
```

### Image Optimisation & S3 Upload

The repository includes a script to optimise images, convert them to WebP format, and upload them to AWS S3 for delivery.

#### Prerequisites

To use the image optimisation and upload functionality, you need:

1. AWS S3 bucket configured for web hosting
2. AWS credentials with permissions to write to the bucket

#### Setup

1. Set your AWS environment variables:

```bash
# Set AWS environment variables
export AWS_BUCKET="your-bucket-name"
export AWS_REGION="your-aws-region"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
```

2. Run the image optimisation and upload script:

```bash
npm run optimise-images
```

This process:
- Optimises all images in the `img/` directory
- Converts images to WebP format (offering ~30% smaller file sizes)
- Preserves the original folder structure
- Uploads both optimised originals and WebP versions to your S3 bucket

#### Using Optimised Images

After running the script, update your HTML to use the optimised images with WebP support:

```html
<picture>
  <source srcset="https://your-bucket.s3.your-region.amazonaws.com/webp/path/to/image.webp" type="image/webp">
  <img src="https://your-bucket.s3.your-region.amazonaws.com/optimised/path/to/image.jpg" alt="Description">
</picture>
```

Using the `<picture>` element provides:
- WebP images for browsers that support them
- Optimised JPG/PNG fallbacks for browsers that don't support WebP
- Better loading performance across all devices

#### Directory Structure

The image optimisation process maintains your original folder structure:
- Original images remain in the `img/` directory (tracked in git)
- Optimised versions are generated in `img-optimised/` (not tracked in git)
- WebP versions are generated in `img-webp/` (not tracked in git)

When uploaded to S3, the same structure is preserved:
- `https://bucket.s3.region.amazonaws.com/optimised/work/example.jpg`
- `https://bucket.s3.region.amazonaws.com/webp/work/example.webp`

### Run All Optimisations

To run all optimisation processes in sequence:

```bash
npm run optimise-all
```

### Key Benefits

- ⚡ Faster page loads with fewer HTTP requests
- 📉 Reduced file sizes through minification
- 🖼️ Modern image formats (WebP) with fallbacks
- 🔧 Automated process through npm scripts
- 🚀 Improved overall site performance
