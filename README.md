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
```

## 📁 Project Structure

```
taniainteractive/
├── .gitignore        # Git ignore file
├── README.md         # This documentation
├── css/              # CSS files
├── js/               # JavaScript files
├── img/              # Image files
└── scripts/          # Build and optimisation scripts
```

## 🔄 Contributing

For team members with access to this private repository:

1. Create a new branch for your feature
2. Implement your changes
3. Submit a pull request for review

## 📦 Asset Optimisation

This repository includes tools to optimise CSS, JavaScript, and images for better performance.

### Setup

```bash
npm install
```

### CSS & JS Optimisation

```bash
npm run optimise-css  # Optimise CSS files
npm run optimise-js   # Optimise JavaScript files
npm run optimise      # Optimise both CSS and JS
```

After optimisation, update your HTML to reference the minified files:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/combined.min.css">

<!-- JavaScript -->
<script src="js/all.min.js"></script>
```

### Image Optimisation & S3 Upload

This requires AWS credentials to be set as environment variables:

```bash
# Set AWS environment variables
export AWS_BUCKET="your-bucket-name"
export AWS_REGION="your-aws-region"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"

# Run image optimisation
npm run optimise-images
```

This will:
1. Optimise all images in the `img/` directory
2. Convert images to WebP format
3. Upload both optimised originals and WebP versions to S3

After optimisation, use the `<picture>` element to leverage WebP with fallbacks:

```html
<picture>
  <source srcset="img/webp/example.webp" type="image/webp">
  <img src="img/optimised/example.jpg" alt="Example image">
</picture>
```

### Run All Optimisations

```bash
npm run optimise-all
```

### Key Benefits
- ⚡ Faster page loads with fewer HTTP requests
- 📉 Reduced file sizes through minification
- 🖼️ Modern image formats (WebP) with fallbacks
- 🔧 Automated process through npm scripts
- 🚀 Improved overall site performance
