# taniainteractive.co.uk

Personal portfolio of Tânia Lopes (Tata) - Founder & CEO of Landing Pad Digital.

## About

A single-page portfolio showcasing 20+ years of international experience in AI product development, accessibility-first web platforms, and digital strategy across Portugal, Scotland, and Thailand.

## Ventures

- **Landing Pad Digital** - AI-powered website builder and digital marketing platform (landingpad.digital)
- **Stepify** - AI-powered tutorial generation SaaS (stepify.it)
- **Tangible Studios** - Accessibility-first digital agency (tangible-studios.com)

## Tech Stack

- Single HTML file, no build tools or dependencies
- Google Fonts (Manrope + DM Sans)
- CSS custom properties with dark/light theme
- Vanilla JavaScript (theme toggle, scroll animations, form handling, email obfuscation)
- Formspree for contact form submissions
- Hosted on GitHub Pages with Cloudflare DNS and SSL

## Accessibility

This site is built to WCAG 2.1 AA standards:

- Semantic HTML landmarks (nav, main, section, article, footer)
- Sequential heading hierarchy with no skipped levels
- Skip-to-content link
- Visible focus indicators on all interactive elements
- Screen reader announcements for form validation and status
- All external links announce new tab behaviour
- Decorative elements hidden from assistive technology
- `prefers-reduced-motion` respected in CSS and JavaScript
- Colour contrast exceeding 4.5:1 in both light and dark themes
- Minimum 44px touch targets
- Properly labelled form inputs with `aria-required` and `aria-describedby`

## Deployment

Push to `main` and GitHub Pages serves it automatically. Domain routing is handled by Cloudflare.

```
git add .
git commit -m "Update"
git push origin main
```

## Contact

- tata@landingpad.digital
- linkedin.com/in/taniainteractive

## Licence

Copyright 2004 - 2026 Tânia Lopes. All rights reserved.
