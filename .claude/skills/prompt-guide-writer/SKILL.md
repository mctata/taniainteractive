---
name: prompt-guide-writer
description: Draft content for a new taniAInteractive Prompt Guide (Sales, Finance, Automation, or any future topic in the series). Use this whenever Tata asks to write, draft, or create a new prompt guide, a guide for the prompt-guides product line, or mentions adding a guide alongside the existing Marketing one. Produces markdown content only, no HTML or design, matching the exact 12-prompt structure and tone already established by the Marketing guide.
---

# Prompt Guide Writer

Drafts a complete 12-prompt guide for the taniAInteractive Prompt Guides product line, in the same shape, tone, and quality bar as the existing Marketing guide. Output is content only, in markdown, for Tata to review before any design or PDF work happens. Never jump straight to HTML or a mockup from this skill, that is a separate, later step she asks for explicitly.

## Reference example

Treat the existing Marketing guide content as the canonical style reference. If it's available in the repo or conversation, read it before drafting. Match its exact structure: four sections of three prompts each, every prompt with a reusable bracketed template, a real filled-in small-business example, and a one-line "why this works" note.

## Structure per guide

- 4 sections, 3 prompts per section, 12 prompts total.
- Section names should be genuine sub-topics of the guide's subject, not generic filler. For the Marketing guide these were: Strategy & Positioning, Content & Copy, Campaigns & Ads, Growth & Optimisation. For a new topic, propose four sensible sub-groupings before drafting and confirm them if there's any doubt, rather than guessing.
- Each prompt has three parts, always in this order:
  1. **Template**: the reusable prompt with `[bracketed placeholders]`, written as something a non-technical person could paste directly into an AI tool. End the template with one additional sentence that extends it into a genuine next step, asking the AI to also suggest a follow-up, an alternative, or a way to personalise the output. This is not padding, it must be something the AI would actually do differently because of that sentence, not filler words added purely for length. At a $9.99-ish price point a one-sentence prompt reads as thin, but a second sentence tacked on for the sake of length would make the prompt worse to actually use, so the added sentence has to earn its place the same way the rest of the prompt does.
  2. **Real example**: the same template filled in for one specific, named small business (see industry rules below), including the same follow-up sentence, filled in consistently with the rest of the example.
  3. **Note**: one sentence on when or why this prompt earns its place. Not a generic compliment, a specific reason.

## Industry diversity rules

- Every one of the 12 examples within a single guide must be a different small business type. No repeats inside one guide.
- Draw from real local small businesses: hairdresser, dentist, physiotherapist, veterinary clinic, optician, yoga studio, personal trainer, real estate agent, pet groomer, accountant or bookkeeper, life coach, restaurant or cafe, driving instructor, tattoo studio, cleaning service, chiropractor, photographer, and similar. This is the target buyer, someone who sees their own kind of business reflected, not a tech or marketing company.
- Across the guide series as a whole, try not to lean on the exact same two or three industries in every single guide, spreading coverage wider is good for the range of keyword-rich small-business terms that end up in the finished content.
- The last prompt in a guide (the "wrap-up" or review-style prompt) can stay industry-agnostic if that fits the prompt better, that's the one acceptable exception to strict diversity.

## Voice and tone

- No em dashes or double dashes, ever.
- UK English.
- Plain and concrete over clever or jargon-heavy. This applies to the templates, the examples, and especially the "why it works" notes, a busy small business owner should never have to look up a term.
- Encouraging, not intimidating. Assume the reader has never written an AI prompt before.

## Output format

Deliver as a single markdown file, following this exact shape for each prompt:

```
### N. Prompt Title
**Template:**
> "..."

**Real example - Industry Name:**
> "..."

*One-line note on why this works.*
```

Group prompts under `## Section N: Section Name` headers, four sections total. Include a title line at the top and a short "how to use this guide" intro paragraph matching the Marketing guide's pattern, two or three sentences, not more.

## After drafting

Stop. Present the draft for review. Do not proceed to HTML, PDF design, or the hosted page until Tata has reviewed and approved the content, exactly as happened with the Marketing guide.