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

## 📦 CSS Optimisation

This repository includes tools to optimise and combine CSS files for better performance.

### Simple CSS Optimisation Method

For quick CSS optimisation without Node.js version compatibility issues:

1. **Manually combine CSS files**:
   ```
   cat css/bootstrap.css css/style.css > css/combined.css
   ```

2. **Use an online minifier**:
   - Go to [CSS Minifier](https://cssminifier.com/)
   - Paste the content of combined.css
   - Copy the minified output to css/combined.min.css

3. **Update HTML**:
   ```html
   <!-- Replace these two lines -->
   <link rel="stylesheet" href="css/bootstrap.css">
   <link rel="stylesheet" href="css/style.css">
   
   <!-- With this single line -->
   <link rel="stylesheet" href="css/combined.min.css">
   ```

### Key Benefits
- ⚡ Faster page loads (one request instead of two)
- 📉 Reduced file size
- 🔧 Easier maintenance with a single CSS file
