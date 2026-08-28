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

| Gemma                                                                                                                                                                                          | Codex                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Gemma Good Deal output rendering as a mostly unstyled page with default links, plain buttons, and sparse left-aligned content.](/images/articles/local-llm-gooddeal-buildoff/gemma-hero.jpg) | ![Codex Good Deal hero with a cream background, bold headline, search bar, product deal card, price alert, and savings widget.](/images/articles/local-llm-gooddeal-buildoff/gooddeal-hero-example.jpg) |

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
