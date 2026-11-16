---
title: 'Seven local builds on web UI tasks: the gap is unfinished pages, not ugly ones'
slug: 'local-qwen-builds-web-ui'
description: 'I gave the same seven local Qwen3.8-Flash-Next builds 20 web UI tasks from ArtifactsBench, judged by Claude Opus 5.5. Gyro-S and the 2-bit Q2_0 tied for first, Claude Code stayed well ahead, and most of the gap came from pages the local builds never finished.'
date: '2026-11-16'
category: 'AI Engineering'
tags:
  - ai-agents
  - benchmark
  - artifactsbench
  - web-ui
  - local-llm
  - strata
  - qwen
status: 'published'
author: 'Rifan Fauzi'
---

The [last article](/articles/local-qwen-builds-aider-polyglot) ranked my seven local builds of Qwen3.8-Flash-Next on coding exercises, and Gyro-S came out on top. Most of what I build with a local model is not an exercise, though. It is a page: a dashboard, an admin screen, a form. So I ran the same seven builds, in the same agent, through 20 web UI tasks, and had Claude Opus 5.5 judge the pages from screenshots and code.

The short answer: Gyro-S and the 2-bit Q2_0 tied for first at 45 out of 100, and Claude Code, run as a reference, scored 67. The more useful finding is where the gap comes from. When a local build finished a page, the page scored about 50, whichever build made it. The builds differ mostly in how often they finished.

## What I ran

**Benchmark.** [ArtifactsBench](https://github.com/Tencent-Hunyuan/ArtifactsBenchmark) from Tencent Hunyuan (CC BY 4.0): about 1,800 requests for visual, interactive artifacts, each with a 10-item checklist for the judge. I took 20 of them from the web categories (web apps, admin and management screens, data dashboards, office and calculation tools), left out games, SVG art and anything that needs a backend or a framework build, and spread the 20 evenly over easy, medium and hard. The selection uses a fixed seed, so it can be rebuilt.

**The task.** Each agent got the original request plus one paragraph: build it as a static page at `/app/index.html`, more files allowed, libraries from a CDN allowed, no build step. Examples: a hotel booking page with live prices, an inventory management system, a panoramic VR viewer, a word-cloud dashboard, a horror game's official website.

**Rendering.** After the agent finished, the verifier opened the page in headless Chromium (Playwright) and took three screenshots: the full page, then the top of the page one and two seconds later, to catch animation and late rendering. It also kept a copy of the page's code and any console errors.

**Judge.** Claude Opus 5.5 with the ArtifactsBench judge prompt, word for word. It sees the request, the checklist, the code and the screenshots, and nothing about which model or agent made the page. The original benchmark uses Gemini 2.5 Pro as judge, so these scores are not comparable with the ArtifactsBench leaderboard, only with each other. Every page was judged twice and the two scores averaged; the two runs differed by 1.4 to 3.2 points on average per build.

**Same agent and server as last time.** Every local build ran in dsh 0.2.2-rc.1 (headless, high effort) against Strata engine 0.1.59: 128K context, three requests at a time, MTP drafting, vision off. Each build was started, run through the 20 tasks three at a time, and stopped before the next one.

**Rules.** One attempt per task, 30 minutes per task (the task's own limit). Trials broken by the harness, the network or the machine were rerun, not counted.

| Component | Spec                                                         |
| --------- | ------------------------------------------------------------ |
| CPU       | AMD Ryzen 9 9950X (16 cores)                                 |
| GPU       | 2x NVIDIA GeForce RTX 3090, 24GB each, layer split           |
| RAM       | 96GB                                                         |
| Engine    | Strata 0.1.59, 128K context, 3 parallel requests             |
| Agent     | dsh 0.2.2-rc.1 (local builds), Claude Code 2.1.325           |
| Tasks     | 20 ArtifactsBench web UI tasks, one attempt, 30 min limit    |
| Judge     | Claude Opus 5.5, ArtifactsBench checklist prompt, two passes |

The builds are the same seven as in the [Aider Polyglot article](/articles/local-qwen-builds-aider-polyglot), from the 58GB Gyro-S to the 94GB Unsloth build. The reference is Claude Code 2.1.325 with Sonnet 5.5 at high effort. As before, it is a different agent as well as a different model, so read it as "what a frontier setup does on these tasks".

## Results

![Judge score out of 100: Claude Code 66.5, Gyro-S 45.3, Qwen Q2_0 45.3, Swift IQ3_S 36.9, Qwen IQ3_S 35.9, Gyro-M 35.9, Unsloth UD-IQ4_XS 31.3, Coder IQ1_M 16.1](/images/articles/local-qwen-builds-web-ui/ui-score.png)

| Build                    | Score    | Pages rendered | Hit the 30 min limit | Score at 15 min | Model file |
| ------------------------ | -------- | -------------- | -------------------- | --------------- | ---------- |
| Claude Code (Sonnet 5.5) | **66.5** | 20 / 20        | 0                    | not run         | cloud      |
| Gyro-S                   | **45.3** | 18 / 20        | 1                    | 43.8            | 58.5 GB    |
| Qwen Q2_0                | **45.3** | 18 / 20        | 8                    | 41.0            | 66.4 GB    |
| Swift IQ3_S              | **36.9** | 15 / 20        | 11                   | 25.2            | 83.7 GB    |
| Qwen IQ3_S (default)     | **35.9** | 14 / 20        | 1                    | 35.2            | 83.6 GB    |
| Gyro-M                   | **35.9** | 14 / 20        | 7                    | 27.2            | 92.0 GB    |
| Unsloth UD-IQ4_XS        | **31.3** | 12 / 20        | 6                    | 24.6            | 93.7 GB    |
| Coder IQ1_M              | **16.1** | 12 / 20        | 5                    | 13.7            | 58.4 GB    |

A task with no usable page scores 0, and the score is the mean over all 20 tasks. A build that hit the time limit can still have a page, if it wrote one before time ran out.

Gyro-S and Q2_0 are tied (45.30 against 45.28 before rounding). Swift, IQ3_S and Gyro-M are within one point of each other, so I read this table as three groups: Gyro-S and Q2_0 on top, then those three with Unsloth a little behind, then Coder IQ1_M well behind. Claude Code is 21 points above the best local build and delivered a page for every task.

### I first ran it at 15 minutes

My first pass used a 15-minute limit, the same as the Aider article. That was a mistake for this benchmark: a full page with its scripts and styles is a lot of output, and most builds ran out of time on half their tasks or more (Unsloth on 17 of 20). I reran every timed-out task at 30 minutes. The "score at 15 min" column shows what changed. Gyro-S and IQ3_S barely moved: the extra time on their reruns rarely produced a better page. Swift IQ3_S gained 12 points and Gyro-M 9. Claude Code ran at 30 minutes from the start, so it has no 15-minute score. Gyro-M's 15-minute score is over 19 tasks, since one of its first-pass trials broke in setup.

## Finished pages look alike

![Pages rendered against the mean score of only those pages: the local builds sit between 49 and 52 except Coder IQ1_M at 27, Claude Code at 66.5 with 20 pages](/images/articles/local-qwen-builds-web-ui/ui-coverage.png)

This is the chart I would show anyone choosing between these builds. Count only the pages that rendered, and six of the seven local builds land between 49 and 52: Unsloth's 12 pages average 52.1, Gyro-S's 18 pages average 50.3. What separates them in the main table is the number of pages, not their quality. Coder IQ1_M is the exception: its pages are worse, not just fewer.

Claude Code is ahead on both axes. Every one of its 20 pages rendered, and they average 66.5. Its lowest score on any task was 54.

![Score per task and build; the local builds have many empty cells, Claude Code none](/images/articles/local-qwen-builds-web-ui/ui-task-grid.png)

The grid shows the same thing task by task. On the easier requests (a hotel booking page, a login page, an analog clock) several local builds match or beat Claude's score: on 9 of the 20 tasks at least one local build scored higher. But it is a different build each time, and picking the best of seven after the fact flatters them. The bottom half of the grid, where the requests get bigger (a knowledge base system, a legal document manager, a music theory course, a VR viewer), is mostly empty cells for the local builds.

## Why pages went missing

I read the trajectories of the 37 local trials that produced no page. Six simply ran out of time. The other 31 ended the same way: one reply from the model reached dsh's output limit of 16,384 tokens, and dsh, running headless, ended the session there. These models like to write the whole page in one go, so a long page ends in the middle of writing a file.

The same limit leaves a quieter kind of failure. **28 local pages rendered but load a script or stylesheet that was never written**: the model wrote `index.html` first, with `<script src="js/app.js">`, and the session ended before `app.js` existed. Every one of those 28 ended at the output limit or the time limit. Claude Code had none.

![Panoramic VR viewer task: Claude Code 76 and Gyro-S 58 render a panorama, Qwen Q2_0 has no page, Qwen IQ3_S shows an error message and scores 12](/images/articles/local-qwen-builds-web-ui/shots-panorama-vr.png)

The VR viewer is a good example. Claude Code and Gyro-S both built working WebGL panoramas. Q2_0 produced no page at all. IQ3_S's page says the browser does not support WebGL, which sounds like a problem with the test setup, so I checked: WebGL works in the verifier's Chromium. The real cause is that the page's three scripts were never written, and the fallback message was the only thing left to show.

This is a property of the agent as much as the model. A higher output limit in dsh, or an agent that writes large files in pieces, would probably turn many of these zeros into pages. I kept the default because it is what I would actually run, and because the goal was to compare the builds in one fixed setup.

When nothing went wrong, the pages were close. Here is the hotel booking task, where every build finished:

![Hotel booking task: Claude Code 76, Gyro-S 72, Qwen Q2_0 62, Qwen IQ3_S 73](/images/articles/local-qwen-builds-web-ui/shots-hotel-booking.png)

All four are reasonable booking pages with live prices. IQ3_S wrote its page in Chinese, although the request was in English. The judge did not mark it down for that, and the checklist does not ask about language, but I would have.

The [appendix](#appendix-every-page) has the same view of every page from all 20 tasks and all eight builds.

## Where the points went

![Share of each checklist area's points per build: Claude Code leads every area, most clearly visual design (76%) and features (67%)](/images/articles/local-qwen-builds-web-ui/ui-areas.png)

The ArtifactsBench checklist has four task-specific items (features, 40 points) and six general ones: visual design, interaction, code quality (two items), innovation and redundancy. Claude Code leads every area. The largest gaps are visual design (76% against Gyro-S's 55%) and features (67% against Q2_0's 46%). Missing pages pull every area down for the local builds, which is why their profiles look so similar.

One advantage the table does not show: Claude Code can look at its own work. It took screenshots of its page and read them in 13 of the 20 tasks. The local builds ran with vision off, so they never saw what they built.

## Web UI against coding

![Web UI score against Aider Polyglot score for the same builds: Gyro-S high on both, Q2_0 much better at UI than coding, Coder IQ1_M low on both](/images/articles/local-qwen-builds-web-ui/ui-vs-coding.png)

Putting this next to the Aider results:

- **Gyro-S is at the top of both.** First on web UI (tied), first on coding exercises (tied with Swift).
- **Q2_0 changes the most.** Second to last on coding (7 of 20), tied first on UI. Its pages are no better than the others', it simply finished more of them (18 of 20), helped by the fastest generation speed of the seven.
- **Swift IQ3_S drops.** Tied first on coding, third on UI, and it hit the time limit more than any other build (11 times). It writes the most per task.
- **Coder IQ1_M is last on both**, the only build whose finished pages are also clearly worse.

## Speed

Generation speed comes from Strata's own per-request log, time per task from the agent's start to finish, tool calls and its own checks included.

| Build                    | Generation tok/s | Prompt read tok/s | Median time per task | Mean time per task | Median output tokens per task |
| ------------------------ | ---------------- | ----------------- | -------------------- | ------------------ | ----------------------------- |
| Qwen Q2_0                | **167**          | 1,796             | 19.6 min             | 19.3 min           | 55.4K                         |
| Gyro-S                   | 152              | 1,486             | **10.6 min**         | **11.9 min**       | **33.8K**                     |
| Swift IQ3_S              | 146              | 1,442             | 30.0 min             | 22.3 min           | 62.7K                         |
| Qwen IQ3_S               | 142              | 1,405             | **10.6 min**         | 13.5 min           | 37.5K                         |
| Gyro-M                   | 141              | 1,461             | 13.5 min             | 17.4 min           | 43.0K                         |
| Coder IQ1_M              | 134              | **1,844**         | 18.5 min             | 19.4 min           | 47.8K                         |
| Unsloth UD-IQ4_XS        | 121              | 1,037             | 21.7 min             | 20.5 min           | 49.8K                         |
| Claude Code (Sonnet 5.5) | cloud            | cloud             | 3.6 min              | 6.5 min            | cloud                         |

Generation speed is per request while three requests share the two GPUs.

UI work is much heavier than the coding exercises: the local builds write a median of 34K to 63K tokens per page, against 9K to 21K per Aider task. Gyro-S is the most economical, and it is the only build that is both fast per task and at the top of the score table. Q2_0 gets its score by generating fastest and writing a lot. Swift's median of 30.0 minutes means more than half its tasks ran to the limit.

## What I am keeping

Gyro-S stays my default local build. It tied for first here, it was first on the coding exercises, it finished a typical page in about 11 minutes, and it is the smallest file. Q2_0 matched its UI score, but it took nearly twice as long per page and was second to last on coding.

The more useful lesson is about the agent. Most of the gap between local builds, and part of the gap to Claude Code, is pages that were cut off by dsh's output limit. Before I compare models again on UI work, I will raise that limit or use an agent that writes big files in parts, and I expect the local scores to move more from that change than from any choice between these builds.

The gap to Claude Code remains real even so. On the pages that did render, Claude Code still scored about 15 points higher, finished in a third of the time, and it can look at what it built. For a quick internal screen I would let Gyro-S draft it and fix it up myself. For anything a customer sees, I would still reach for Claude.

## Caveats

- 20 tasks, one attempt each. Differences of a few points are within noise; the judge alone moves a page by 1 to 3 points between runs.
- The judge is a Claude model, and the reference is Claude Code with a Claude model. It never sees which agent built a page, but a judge preferring its own family's style cannot be ruled out.
- Claude Code had vision and used it on 13 tasks. The local builds ran with vision off.
- dsh's 16,384-token output limit decided many local scores. A different agent or limit would give different numbers.
- ArtifactsBench normally uses Gemini 2.5 Pro as judge. These scores are only comparable with each other.
- All builds are quantized. The scores describe these files on this hardware, not the full-precision model.
- No agent tried to fetch the benchmark's data or reference answers.

## Reproducing it

The scripts are in the same benchmark folder as the earlier articles:

```bash
# build the 20-task subset (fixed seed) as Harbor tasks
python3 scripts/build_artifacts_ui.py 20

# each Strata build in dsh, then Claude Code; judge with Opus 5.5 (2 passes) and write the report
scripts/run_ui_quick.sh

# rerun tasks that hit the first 15-minute limit at 30 minutes, then judge and report again
scripts/rerun_ui_timeouts.sh

# charts
.venv/bin/python scripts/make_charts_ui.py reports/ui-quick OUT_DIR reports/aider-quick

# appendix: first screen of every page as WebP, plus the gallery Markdown
.venv/bin/python scripts/make_ui_appendix.py OUT_DIR /images/articles/local-qwen-builds-web-ui/appendix > appendix.md
```

If you run local models on UI tasks, read the end of a few failed sessions before you read the scores. Here, a missing page usually meant the agent hit its output limit, not that the model could not build it.

## Appendix: every page

Here is the top of every page that rendered, 123 of the 160 trials, as the verifier's headless Chromium saw it: the first 1280 by 720 pixels. Click a screenshot to see it larger. Builds are in the order of the results table, each with its judge score (the average of the two passes). "No page" means the session ended without a usable `index.html`, usually at dsh's output limit. "Blank page" means the page loaded but drew nothing; in all seven cases, the scripts it loads were never written.

**Heatmap from a large scatter dataset** (ab-0334, hard). Turn a large `[x, y, value]` dataset into a heatmap with d3.js. No page: Unsloth UD-IQ4_XS.

|                                                                                                             |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 71](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-claude-code.webp) | ![Gyro-S, judge score 58](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 54](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 70](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 68](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-qwen-iq3-s.webp)   | ![Gyro-M, judge score 58](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-gyro-m.webp)           |
| ![Coder IQ1_M, judge score 24](/images/articles/local-qwen-builds-web-ui/appendix/ab-0334-coder-iq1-m.webp) |                                                                                                             |

**Word-cloud dashboard** (ab-0416, medium). A visualization dashboard built around a word cloud. No page: Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-claude-code.webp) | ![Gyro-S, judge score 60](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 67](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-qwen-iq3-s.webp)   | ![Gyro-M, judge score 60](/images/articles/local-qwen-builds-web-ui/appendix/ab-0416-gyro-m.webp)           |

**Vocabulary flashcards** (ab-0439, easy). Read words from a file, sort them, add translations and example sentences, and quiz them as flashcards. No page: Gyro-M.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 74](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-claude-code.webp) | ![Gyro-S, judge score 55](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-gyro-s.webp)                       |
| ![Qwen Q2_0, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 76](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-swift-iq3-s.webp)             |
| ![Qwen IQ3_S, judge score 68](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-qwen-iq3-s.webp)   | ![Unsloth UD-IQ4_XS, judge score 70](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 52](/images/articles/local-qwen-builds-web-ui/appendix/ab-0439-coder-iq1-m.webp) |                                                                                                                         |

**Food recommendation page** (ab-0472, easy). Food cards from an API with ratings and addresses, a details view with comments, and filters. No page: Qwen Q2_0, Swift IQ3_S, Qwen IQ3_S, Coder IQ1_M.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-0472-claude-code.webp) | ![Gyro-S, judge score 69](/images/articles/local-qwen-builds-web-ui/appendix/ab-0472-gyro-s.webp)                       |
| ![Gyro-M, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-0472-gyro-m.webp)           | ![Unsloth UD-IQ4_XS, judge score 66](/images/articles/local-qwen-builds-web-ui/appendix/ab-0472-unsloth-ud-iq4-xs.webp) |

**Inventory management system** (ab-0480, medium). Add, edit and delete items, low-stock warnings, reports and barcode scanning. No page: Gyro-M, Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 71](/images/articles/local-qwen-builds-web-ui/appendix/ab-0480-claude-code.webp) | ![Gyro-S, judge score 57](/images/articles/local-qwen-builds-web-ui/appendix/ab-0480-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0480-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 30](/images/articles/local-qwen-builds-web-ui/appendix/ab-0480-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 34](/images/articles/local-qwen-builds-web-ui/appendix/ab-0480-qwen-iq3-s.webp)   |                                                                                                             |

**Hotel room booking** (ab-0510, medium). Pick check-in and check-out dates and see room types with live prices, then book.

|                                                                                                                         |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 76](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-claude-code.webp)             | ![Gyro-S, judge score 72](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-qwen-q2-0.webp)                 | ![Swift IQ3_S, judge score 73](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 73](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-qwen-iq3-s.webp)               | ![Gyro-M, judge score 77](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-gyro-m.webp)           |
| ![Unsloth UD-IQ4_XS, judge score 74](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-unsloth-ud-iq4-xs.webp) | ![Coder IQ1_M, judge score 18](/images/articles/local-qwen-builds-web-ui/appendix/ab-0510-coder-iq1-m.webp) |

**Furniture shop with room planner** (ab-0519, hard). Browse furniture by category and drag pieces into a virtual room, then save the layout. No page: Swift IQ3_S, Qwen IQ3_S, Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0519-claude-code.webp) | ![Gyro-S, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-0519-gyro-s.webp) |
| ![Qwen Q2_0, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-0519-qwen-q2-0.webp)     | ![Gyro-M, judge score 56](/images/articles/local-qwen-builds-web-ui/appendix/ab-0519-gyro-m.webp) |

**Music theory course** (ab-0521, hard). Lessons on scales and chords with audio examples and simple practice exercises. No page: Swift IQ3_S, Qwen IQ3_S, Gyro-M, Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 74](/images/articles/local-qwen-builds-web-ui/appendix/ab-0521-claude-code.webp) | ![Gyro-S, judge score 50](/images/articles/local-qwen-builds-web-ui/appendix/ab-0521-gyro-s.webp) |
| ![Qwen Q2_0, judge score 52](/images/articles/local-qwen-builds-web-ui/appendix/ab-0521-qwen-q2-0.webp)     |                                                                                                   |

**Blog community with topic circles** (ab-0539, medium). Join topic circles, publish articles in them, vote and comment. No page: Swift IQ3_S, Coder IQ1_M.

|                                                                                                             |                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 58](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-claude-code.webp) | ![Gyro-S, judge score 56](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-gyro-s.webp)                                  |
| ![Qwen Q2_0, judge score 52](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-qwen-q2-0.webp)     | ![Qwen IQ3_S, judge score 26](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-qwen-iq3-s.webp)                          |
| ![Gyro-M, judge score 54](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-gyro-m.webp)           | ![Unsloth UD-IQ4_XS, judge score 8, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0539-unsloth-ud-iq4-xs.webp) |

**Knowledge base management** (ab-0628, hard). Upload Markdown and HTML articles, tag and categorize them, with an administrator login. No page: Gyro-M.

|                                                                                                             |                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 59](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-claude-code.webp) | ![Gyro-S, judge score 50](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-gyro-s.webp)                                  |
| ![Qwen Q2_0, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 33, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-swift-iq3-s.webp)            |
| ![Qwen IQ3_S, judge score 31](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-qwen-iq3-s.webp)   | ![Unsloth UD-IQ4_XS, judge score 6, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 30](/images/articles/local-qwen-builds-web-ui/appendix/ab-0628-coder-iq1-m.webp) |                                                                                                                                    |

**Legal document management** (ab-0660, hard). Upload, categorize and search legal documents, generate templates and extract key clauses.

|                                                                                                                                     |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-claude-code.webp)                         | ![Gyro-S, judge score 14](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-gyro-s.webp)                       |
| ![Qwen Q2_0, judge score 28](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-qwen-q2-0.webp)                             | ![Swift IQ3_S, judge score 12, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 30, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-qwen-iq3-s.webp)               | ![Gyro-M, judge score 46](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-gyro-m.webp)                       |
| ![Unsloth UD-IQ4_XS, judge score 10, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-unsloth-ud-iq4-xs.webp) | ![Coder IQ1_M, judge score 10, blank page](/images/articles/local-qwen-builds-web-ui/appendix/ab-0660-coder-iq1-m.webp) |

**Login window** (ab-0713, easy). A user login window, nothing more specified.

|                                                                                                                         |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 60](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-claude-code.webp)             | ![Gyro-S, judge score 32](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 63](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-qwen-q2-0.webp)                 | ![Swift IQ3_S, judge score 66](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 67](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-qwen-iq3-s.webp)               | ![Gyro-M, judge score 57](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-gyro-m.webp)           |
| ![Unsloth UD-IQ4_XS, judge score 65](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-unsloth-ud-iq4-xs.webp) | ![Coder IQ1_M, judge score 36](/images/articles/local-qwen-builds-web-ui/appendix/ab-0713-coder-iq1-m.webp) |

**Split-screen login page** (ab-0771, easy). An image on the left, the login form on the right, responsive. No page: Qwen IQ3_S.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 70](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-claude-code.webp) | ![Gyro-S, judge score 76](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-gyro-s.webp)                       |
| ![Qwen Q2_0, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 80](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-swift-iq3-s.webp)             |
| ![Gyro-M, judge score 72](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-gyro-m.webp)           | ![Unsloth UD-IQ4_XS, judge score 78](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-0771-coder-iq1-m.webp) |                                                                                                                         |

**Panoramic VR viewer** (ab-1102, hard). A panoramic VR view without any library. No page: Qwen Q2_0, Gyro-M, Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 76](/images/articles/local-qwen-builds-web-ui/appendix/ab-1102-claude-code.webp) | ![Gyro-S, judge score 58](/images/articles/local-qwen-builds-web-ui/appendix/ab-1102-gyro-s.webp)         |
| ![Swift IQ3_S, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-1102-swift-iq3-s.webp) | ![Qwen IQ3_S, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-1102-qwen-iq3-s.webp) |

**Shopping price comparison** (ab-1107, easy). A small program that compares prices across shops. No page: Gyro-S.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 61](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-claude-code.webp) | ![Qwen Q2_0, judge score 56](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-qwen-q2-0.webp)                 |
| ![Swift IQ3_S, judge score 60](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-swift-iq3-s.webp) | ![Qwen IQ3_S, judge score 54](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-qwen-iq3-s.webp)               |
| ![Gyro-M, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-gyro-m.webp)           | ![Unsloth UD-IQ4_XS, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-1107-coder-iq1-m.webp) |                                                                                                                         |

**Horror game website** (ab-1162, easy). An official site for a horror game: collapsible support panel, downloads, intro, gallery, scary background. No page: Gyro-S, Swift IQ3_S, Qwen IQ3_S, Unsloth UD-IQ4_XS, Coder IQ1_M.

|                                                                                                             |                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 72](/images/articles/local-qwen-builds-web-ui/appendix/ab-1162-claude-code.webp) | ![Qwen Q2_0, judge score 56](/images/articles/local-qwen-builds-web-ui/appendix/ab-1162-qwen-q2-0.webp) |
| ![Gyro-M, judge score 18](/images/articles/local-qwen-builds-web-ui/appendix/ab-1162-gyro-m.webp)           |                                                                                                         |

**Analog clock** (ab-1396, medium). A simulated clock in HTML, CSS and JavaScript. No page: Gyro-M.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 70](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-claude-code.webp) | ![Gyro-S, judge score 54](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-gyro-s.webp)                       |
| ![Qwen Q2_0, judge score 60](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 69](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-swift-iq3-s.webp)             |
| ![Qwen IQ3_S, judge score 69](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-qwen-iq3-s.webp)   | ![Unsloth UD-IQ4_XS, judge score 73](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 16](/images/articles/local-qwen-builds-web-ui/appendix/ab-1396-coder-iq1-m.webp) |                                                                                                                         |

**Web photo album** (ab-1545, medium). A photo album in JavaScript. No page: Unsloth UD-IQ4_XS.

|                                                                                                             |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 54](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-claude-code.webp) | ![Gyro-S, judge score 32](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 48](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 12](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 56](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-qwen-iq3-s.webp)   | ![Gyro-M, judge score 18](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-gyro-m.webp)           |
| ![Coder IQ1_M, judge score 18](/images/articles/local-qwen-builds-web-ui/appendix/ab-1545-coder-iq1-m.webp) |                                                                                                             |

**Web chat with rooms** (ab-1663, medium). A chat tool whose homepage has "Create Room" and "Join Room" buttons. No page: Qwen IQ3_S.

|                                                                                                             |                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-claude-code.webp) | ![Gyro-S, judge score 50](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-gyro-s.webp)                       |
| ![Qwen Q2_0, judge score 52](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-qwen-q2-0.webp)     | ![Swift IQ3_S, judge score 19](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-swift-iq3-s.webp)             |
| ![Gyro-M, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-gyro-m.webp)           | ![Unsloth UD-IQ4_XS, judge score 52](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-unsloth-ud-iq4-xs.webp) |
| ![Coder IQ1_M, judge score 6](/images/articles/local-qwen-builds-web-ui/appendix/ab-1663-coder-iq1-m.webp)  |                                                                                                                         |

**Real estate rose chart** (ab-1767, easy). A rose chart of house prices in 100 Chinese cities.

|                                                                                                                         |                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Claude Code, judge score 68](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-claude-code.webp)             | ![Gyro-S, judge score 49](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-gyro-s.webp)           |
| ![Qwen Q2_0, judge score 49](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-qwen-q2-0.webp)                 | ![Swift IQ3_S, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-swift-iq3-s.webp) |
| ![Qwen IQ3_S, judge score 62](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-qwen-iq3-s.webp)               | ![Gyro-M, judge score 64](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-gyro-m.webp)           |
| ![Unsloth UD-IQ4_XS, judge score 59](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-unsloth-ud-iq4-xs.webp) | ![Coder IQ1_M, judge score 37](/images/articles/local-qwen-builds-web-ui/appendix/ab-1767-coder-iq1-m.webp) |
