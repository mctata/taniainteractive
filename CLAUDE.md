# taniainteractive

Personal freelance site and product line for Tânia Lopes ("Tata"), front-end developer, trading as taniainteractive. Domain: `taniainteractive.co.uk` (non-www is canonical, not `www.`). Deployed via GitHub Pages, GitHub Actions build source, custom domain configured.

## Voice and formatting, always

- UK English throughout.
- No em dashes or double dashes, ever. Single hyphen or a colon instead.
- No emojis unless Tata uses them first.
- Encouraging, plain, concrete. Avoid jargon and consultant-speak, especially anywhere aimed at small business owners who don't come from a tech or marketing background. Prefer "copy and paste" over "leverage," "if you can type an email" over "no technical skills required."
- Tone is personal and direct, this is Tata's own name and voice, not an agency's.

## Site structure

- Single-page portfolio (`index.html`): hero, disciplines, work, experience sections.
- Fonts: Ubuntu (body and headings) and JetBrains Mono (code, labels, mono accents). PT Serif was dropped from the design system, headings now run in Ubuntu.
- Brand accent colour: `#0B7A5F`.
- Footer identity line, use consistently anywhere the brand needs introducing: "taniainteractive is Tânia Lopes, known as Tata."

## Known deployment gotchas (learned the hard way)

- `assets/js/script.js` and `assets/css/styles.css` were previously gitignored. This broke the live site completely once GitHub Pages became the deploy method, since Pages only serves what's actually committed. Both are now tracked in git. Do not re-add them to `.gitignore`.
- GitHub Pages cannot be enabled on a private repository under the Free plan at all, the "Get Pages site failed" error is the symptom. Repo must be public, or the account needs GitHub Pro.
- GitHub Pages does not support custom HTTP response headers of any kind, no `.htaccess`, no `_headers` file, nothing. Any behaviour that needs a server header (forced downloads, security headers) has to be solved client-side instead.
- The `download` HTML attribute is unreliable specifically for PDFs in some browsers, the built-in PDF viewer can intercept the click before the attribute applies. The reliable fix is a small JS helper that fetches the file as a blob and triggers the save programmatically, see `/prompt-guides/thank-you.html` for the working pattern.
- `noindex` keeps a page out of search results but does not restrict access, anyone with the direct link can still open it.

## Prompt Guides product line

A set of small-business AI prompt guides sold as PDFs, hosted at `/prompt-guides/`. See the `prompt-guide-writer` skill for how new guides get drafted. Current status: Marketing and Sales content approved, Finance and Automation in progress.

**Building the styled HTML/PDF for a new guide: copy, don't rebuild.** Take `template-guide.html` (the finalized Marketing guide, kept as the reusable base) as the literal starting file and swap in the new guide's cards, cover text, and title. Do not regenerate the design from a written description of the style. That file has several fixes in it that took multiple rounds to get right and aren't documented anywhere else: fonts are embedded directly rather than loaded from Google Fonts (loading from Google Fonts failed inside preview environments), the accent colour is the real taniainteractive value (`#0B7A5F`), headings run in Ubuntu not PT Serif, and the print CSS uses `break-after: page` per section with `break-inside: avoid` on each card so nothing splits awkwardly across a page. Rebuilding from scratch risks reintroducing any of these. When reusing it for a new guide, remember to update the `<title>` tag too, not just the visible cover text, since it becomes the PDF's document title in file properties. Also double-check any hardcoded links use the bare domain (`taniainteractive.co.uk`, no `www.`), matching the confirmed CNAME.

Umami analytics website ID is shared with the main portfolio site for now (`b9159426-aeb9-4ff4-bdb9-2cbb214a82f1`). Goals and funnels for the guides are path-scoped within that same website, not a separate site entry, see the `Marketing Guide Purchase` goal and `Marketing Guide Purchase Funnel` as the reference pattern for any new guide's conversion tracking.

Each product needs its own Stripe Payment Link, its own thank-you page (`thank-you-sales.html`, `thank-you-finance.html`, etc., following the pattern of the existing `thank-you.html`), and its own PDF at an obscured filename under `/prompt-guides/pdf/`. The bundle is a `.zip` of all four PDFs, delivered the same way. Nothing dynamic decides which file goes with which purchase, the pairing is fixed once at setup: each Payment Link's "after payment" redirect points at its own specific thank-you page, which links to its own specific file.