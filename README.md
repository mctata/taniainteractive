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
└── [project files]   # Various interactive components and projects
```

## 🔄 Contributing

For team members with access to this private repository:

1. Create a new branch for your feature
2. Implement your changes
3. Submit a pull request for review

## 📦 CSS & JS Optimisation

This repository includes tools to optimise and combine CSS/JS files for better performance.

### Using npm commands (Recommended)

1. **One-time setup**:
   ```bash
   npm install
   ```

2. **To optimise CSS**:
   ```bash
   npm run optimise-css
   ```
   This combines bootstrap.css and style.css into a single minified file: combined.min.css

3. **To optimise JavaScript**:
   ```bash
   npm run optimise-js
   ```
   This combines JS files into a single minified file: all.min.js

4. **To optimise both**:
   ```bash
   npm run optimise
   ```

5. **Update your HTML**:
   ```html
   <!-- Replace CSS links -->
   <link rel="stylesheet" href="css/combined.min.css">
   
   <!-- Replace JS scripts (at the bottom of the page) -->
   <script src="js/all.min.js"></script>
   ```

### Key Benefits
- ⚡ Faster page loads with fewer HTTP requests
- 📉 Reduced file sizes through minification
- 🔧 Automated process through npm scripts
- 🚀 Improved overall site performance
