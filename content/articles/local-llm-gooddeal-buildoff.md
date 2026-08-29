---
title: 'Testing local LLM coding agents on the same landing page brief'
slug: 'local-llm-gooddeal-buildoff'
description: 'A practical build-off where three local LLMs and one frontier Codex run attempted the same Good Deal landing page brief, then got reviewed through build checks, live browser tests, and code inspection.'
date: '2026-08-28'
category: 'AI Engineering'
tags:
  - local-llm
  - coding-agents
  - react
  - typescript
  - tailwind
  - evaluation
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/local-llm-gooddeal-buildoff/cover.jpg'
featured: false
---

I wanted a simple way to compare how far local LLM coding agents can go on a realistic frontend task.

Not a toy button. Not a counter app. Not a small component. A complete landing page brief with product positioning, responsive layout, real interactions, accessibility requirements, and a final validation checklist.

The task was to build a fictional product website called **Good Deal**, a platform for discovering discounts and limited-time offers across online stores. I gave the same prompt to three local model runs, then added one frontier Codex run as a reference point.

After the pages were generated, I asked Claude Code to assess the outputs. The review was not just a visual preference pass. It checked whether the apps built, rendered, responded across breakpoints, handled interactions, and matched the technical requirements in the prompt.

The visual comparison matters because this was a landing page task. The models did not just need to generate React files. They needed to make the product feel real.

| Empero                                                                                                                                                                                 | Ornith                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Empero Good Deal hero with a centered headline, soft pastel gradient background, search bar, and three feature cards.](/images/articles/local-llm-gooddeal-buildoff/empero-hero.jpg) | ![Ornith Good Deal hero with a blue SaaS visual system and a browser-style deal grid on the right.](/images/articles/local-llm-gooddeal-buildoff/ornith-hero.jpg) |

| Gemma                                                                                                                                                                                          | Codex                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Gemma Good Deal output rendering as a mostly unstyled page with default links, plain buttons, and sparse left-aligned content.](/images/articles/local-llm-gooddeal-buildoff/gemma-hero.jpg) | ![Codex Good Deal hero with a cream background, bold headline, search bar, product deal card, price alert, and savings widget.](/images/articles/local-llm-gooddeal-buildoff/codex-hero.jpg) |

_The same prompt produced four very different surfaces: one nearly unstyled result, two credible local landing pages, and one more art-directed frontier baseline._

## The setup

The brief asked every model to build the same thing:

- React
- TypeScript
- Tailwind CSS
- modern component-based architecture
- Lucide icons where useful
- no prebuilt landing page template
- a production-quality landing page that should run after installation

The product was fictional, but the brief was intentionally close to something a real product team might ask for: header, hero, categories, trending deals, deal of the day, store logos, social proof, testimonials, newsletter form, and footer.

It also required actual behavior:

- mobile navigation
- category selection
- deal favorite button
- countdown timer
- newsletter validation
- smooth scrolling
- responsive behavior at 375px, 768px, and 1440px
- accessible controls and visible focus states

That last part matters. A landing page can look finished in a screenshot but still fail the assignment when you click it.

## The full prompt

This is the complete prompt I gave to each coding-agent run. I wanted the task to be specific enough to expose design taste, implementation discipline, responsive behavior, accessibility, and whether the generated project could actually build without manual repair.

```markdown expandable title="Full Good Deal prompt"
Build a complete, production-quality landing page for a fictional product called **Good Deal**.

Good Deal is a platform that helps users discover the best deals, discounts, and limited-time offers from multiple online stores in one place.

Your goal is not just to make the page functional. Create a landing page that looks polished, modern, and comparable to a real startup/product website.

## Technical Requirements

Use:

- React
- TypeScript
- Tailwind CSS
- Modern component-based architecture
- Lucide icons where appropriate

Do not use a prebuilt landing-page template.

The project must run successfully after installation without requiring manual fixes.

## Design Direction

Create a modern SaaS / consumer marketplace visual style.

The page should feel:

- clean
- premium
- trustworthy
- modern
- slightly playful
- conversion-focused

Avoid excessive gradients, excessive rounded cards, and generic AI-generated-looking layouts.

Use strong visual hierarchy, whitespace, good typography, and consistent spacing.

## Page Structure

### 1. Header

Include:

- Good Deal logo / wordmark
- Deals
- Categories
- Stores
- How It Works
- Sign In
- prominent **Find Deals** CTA

Desktop navigation should collapse into a usable mobile menu on smaller screens.

Make the header sticky after scrolling.

### 2. Hero Section

Create a strong headline communicating the value proposition.

Example idea:

**Never Pay Full Price Again**

Add:

- short supporting copy
- primary CTA
- secondary CTA
- search input for products or stores
- visually interesting product/deal presentation

The hero should immediately communicate what Good Deal does without needing additional explanation.

### 3. Deal Categories

Show categories such as:

- Electronics
- Fashion
- Home
- Gaming
- Travel
- Food

Each category should have an appropriate icon and hover interaction.

### 4. Trending Deals

Create at least 6 realistic deal cards.

Each deal should contain:

- product image or visual placeholder
- product title
- store name
- original price
- discounted price
- discount percentage
- rating
- CTA

Example products can include headphones, gaming monitors, sneakers, smartphones, keyboards, or travel deals.

Cards should not all look visually identical.

Highlight particularly good deals.

### 5. Deal of the Day

Create a visually distinctive section featuring one exceptional deal.

Include:

- large product visual
- original and discounted price
- discount percentage
- countdown timer
- CTA

Implement the countdown timer as a working interactive component.

### 6. How Good Deal Works

Explain the product using three simple steps:

1. Search
2. Compare
3. Save

Use icons and concise descriptions.

### 7. Store Logos

Show several fictional or generic partner stores.

Do not depend on external copyrighted logo assets.

### 8. Trust / Social Proof

Add realistic metrics such as:

- 50K+ active shoppers
- 12K+ deals tracked
- 500+ stores
- $2M+ saved by users

Present them in a visually interesting way rather than simply four identical cards.

### 9. Testimonials

Add 3 realistic user testimonials.

Include:

- avatar
- name
- short testimonial
- optional role/location

Avoid overly generic marketing copy.

### 10. Newsletter / Deal Alert

Create a section where users can enter an email address to receive deal alerts.

Implement:

- email validation
- success state
- error state

No backend is required.

### 11. Footer

Include:

- product links
- company links
- resources
- social icons
- copyright
- privacy and terms links

## Interaction Requirements

Implement meaningful interactions rather than making everything static.

Include:

- mobile navigation
- hover/focus states
- category selection
- deal favorite/bookmark button
- countdown timer
- newsletter form validation
- smooth scrolling where appropriate

Buttons should have visible feedback when interacted with.

## Responsive Requirements

The page must work well at:

- 375px mobile
- 768px tablet
- 1440px desktop

Pay particular attention to:

- navigation
- hero layout
- card grids
- typography scaling
- overflow
- spacing

Do not simply stack every desktop element vertically on mobile. Make deliberate responsive design decisions.

## Accessibility

Include:

- semantic HTML
- proper heading hierarchy
- keyboard-accessible controls
- visible focus states
- useful alt text
- appropriate ARIA attributes when necessary
- sufficient color contrast

## Code Quality

Structure the implementation into sensible reusable components.

Avoid:

- one giant component
- unnecessary abstraction
- duplicated markup
- hard-coded styles everywhere
- unused dependencies
- console errors

Create realistic mock data separately from UI components where appropriate.

Use TypeScript types/interfaces properly.

## Important Visual Challenge

Do not make every section use the same pattern of:

heading → subtitle → three rounded cards.

Introduce variation in composition and visual hierarchy across sections.

The final website should feel intentionally designed rather than generated from a generic landing-page recipe.

## Final Validation

Before considering the task complete:

1. Make sure the app builds successfully.
2. Check for TypeScript errors.
3. Check for console errors.
4. Verify responsive behavior.
5. Verify all interactive elements work.
6. Review the UI for inconsistent spacing or alignment.
7. Remove obviously unfinished placeholder content.

When finished, briefly explain:

- the component architecture
- the main design decisions
- which interactions were implemented
- any compromises or assumptions you made
```

## The models

The local model runs used the same coding-agent style workflow and local runtime. I also added a Codex run using GPT-5.6 as a frontier baseline, not as an equal local competitor.

| Build  | Model / setup                 |      Score |
| ------ | ----------------------------- | ---------: |
| Empero | Qwen3.8-9B-Distill, GGUF Q8_0 | 64.5 / 100 |
| Ornith | Ornith-1.5-9B, GGUF Q8_0      | 90.5 / 100 |
| Gemma  | Gemma-4-E4B-it, GGUF Q8_0     | 26.5 / 100 |
| Codex  | OpenAI Codex, GPT-5.6         | 88.5 / 100 |

The headline result surprised me: **the best local run beat the Codex run on this specific prompt and rubric**.

That does not mean a 9B local model is generally better than a frontier cloud model. It means the local model that won this run followed the brief more consistently, shipped fewer serious implementation gaps, and had better engineering structure under review.

## How the outputs were reviewed

Claude Code assessed each generated project against the same rubric. The review included:

- install, build, and TypeScript checks
- lint script behavior when available
- live browser rendering in Chromium
- desktop, tablet, and mobile breakpoints
- console error checks
- DOM-level interaction testing
- dependency usage review
- accessibility checks
- source-code inspection against the original prompt

The key detail is that interactions were actually exercised. A favorite button was clicked. A newsletter form was submitted with valid and invalid emails. The countdown was observed over time. Navigation links were clicked. DOM state was compared before and after.

That caught issues a screenshot would miss.

## Scoreboard

The scores were weighted toward what the prompt cared about most. Interactivity and page structure had more weight than small polish issues because the prompt spent more detail on them.

| Category                                 |     Max |   Empero |   Ornith |    Gemma |    Codex |
| ---------------------------------------- | ------: | -------: | -------: | -------: | -------: |
| Technical setup and stack compliance     |      10 |        7 |        9 |        1 |        9 |
| Design quality and visual craft          |      15 |       11 |       14 |        1 |     14.5 |
| Page structure completeness              |      15 |     13.5 |     14.5 |       11 |       15 |
| Interactivity and functional correctness |      20 |        8 |       18 |        5 |       19 |
| Responsive behavior                      |      10 |        8 |      8.5 |        1 |      9.5 |
| Accessibility                            |      10 |        5 |        9 |        3 |      7.5 |
| Code quality and architecture            |      15 |        8 |       13 |        4 |       10 |
| Final validation and console hygiene     |       5 |        4 |      4.5 |      0.5 |        4 |
| **Total**                                | **100** | **64.5** | **90.5** | **26.5** | **88.5** |

The scores tell a better story when you look at the failure modes.

## Empero: clean surface, broken behavior

Empero looked credible at first glance. It built cleanly, had a polished teal SaaS feel, and included all required page sections.

But the functional review exposed problems:

- the favorite button updated state in `App.tsx`, but that state was never passed down to the deal card
- invalid newsletter submissions set an error message, but never switched the form into an error state
- header navigation used hard links to routes that did not exist
- several installed dependencies were never imported in the app

This is the dangerous kind of AI-generated frontend: visually finished, build passes, console looks clean, but important interactions silently do nothing.

## Ornith: the most complete local result

Ornith won because it combined good visual craft with working behavior.

It shipped a distinctive hero layout, varied section composition, fictional store names, clean responsive behavior, and a better architecture split:

- layout components
- section components
- UI components
- hooks
- data files

The countdown and newsletter logic were pulled into hooks instead of being buried inside rendering components. That mattered because the interactive parts actually worked when tested.

The main issue was tooling: the `lint` script called `eslint`, but ESLint was not installed. That is not ideal, but the app itself installed, built, rendered, and behaved correctly.

For this prompt, Ornith was the strongest local model output.

## Gemma: the app existed, but the project did not hold together

Gemma had the right file names and many of the right sections in JSX, but the project did not survive basic validation.

The biggest failures were structural:

- no `tsconfig.json`
- no `tailwind.config.js`
- no `postcss.config.js`
- no ESLint config
- `npm run build` failed before compiling app code
- Tailwind did not compile, so the rendered page was essentially unstyled HTML

Even when isolating Vite, the generated CSS still contained raw Tailwind directives. That means the page did not just have design problems. Its styling pipeline never existed.

There were also functional bugs: a favorite button with no click handler, a countdown that received `new Date()` and immediately displayed as expired, and category cards with no selection behavior.

This was the reminder that a model can produce a lot of plausible code without producing a runnable project.

## Codex: the strongest design, not the cleanest engineering

The Codex run had the most art-directed visual system. It used a custom color palette, stronger layout variation, a more memorable hero, and better responsive behavior. It also passed almost every live interaction test.

But it did not win.

A few issues held it back:

- primary CTA buttons used a coral background with white text that measured only 2.82:1 contrast
- no lint tooling was configured
- many components lived inside one large `App.tsx`
- a missing favicon caused a real browser console 404
- one unused Lucide icon import remained

These are smaller than Gemma's failures and different from Empero's silent interaction bugs, but they matter because the prompt explicitly asked for accessibility, code quality, and final validation.

Codex felt closest to a polished product website. Ornith felt closer to a disciplined frontend project.

## The thing this test actually measured

This was not a scientific benchmark. It was one task, one prompt, and one generated result per model.

What it measured well was more practical:

> If I give an agent a real frontend brief, how much review work will I still need before trusting the output?

On that question, the differences were clear.

| Build  | What I would trust it for                                                             |
| ------ | ------------------------------------------------------------------------------------- |
| Ornith | A strong first draft that I would review, polish, and maybe ship after fixes          |
| Codex  | A visually strong first draft that needs engineering cleanup and accessibility review |
| Empero | A design draft only, because interactions need manual verification                    |
| Gemma  | Idea generation, not implementation, at least for this setup                          |

The most useful signal was not the total score. It was the class of failure.

- Build failures are obvious.
- Styling pipeline failures are obvious once rendered.
- Contrast failures need measurement.
- Broken state wiring needs interaction testing.
- Navigation that only works by dev-server accident needs deployment awareness.

That is why I do not want to judge coding agents from screenshots alone.

## My takeaway

Local LLMs are already useful for frontend work, but the gap between models is huge even at similar parameter sizes and quantization.

The best local result here was not just acceptable. It was genuinely competitive with a frontier Codex run on this narrow task. The worst local result failed before the app became a real product surface.

That makes local LLM coding feel less like one question and more like a workflow question:

1. Choose the right model.
2. Give it a concrete, testable brief.
3. Make it build something complete.
4. Use another agent or automated checks to review the output.
5. Judge the result through execution, not screenshots.

For now, my rule is simple: **a coding agent output is not done when it looks good. It is done when the build, browser, interactions, accessibility, and source structure all survive review.**
