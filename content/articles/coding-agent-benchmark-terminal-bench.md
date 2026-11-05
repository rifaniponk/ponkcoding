---
title: 'Benchmarking four coding agents on Terminal-Bench 2.0: my local Qwen vs Codex, Claude Code and Antigravity'
slug: 'coding-agent-benchmark-terminal-bench'
description: 'I ran a local Qwen3.8-Flash-Next agent, Codex with GPT-6 Luna, Claude Code with Sonnet 5.5 and Antigravity with Gemini 3.8 Flash through all of Terminal-Bench 2.0. Scores, strong points, and the agent that kept downloading the answer key.'
date: '2026-11-05'
category: 'AI Engineering'
tags:
  - ai-agents
  - benchmark
  - terminal-bench
  - local-llm
  - qwen
  - codex
  - claude-code
status: 'published'
author: 'Rifan Fauzi'
---

I have been using a local Qwen model through [Strata](/articles/strata-local-llm-experience) as a daily coding agent, and I wanted a real answer to a simple question: how does it hold up against the cloud agents I also pay for? Not a vibe check, and not a model benchmark either. I wanted to measure the **agents**: the CLI, its tool loop, its prompts and the model together, doing real work in a terminal.

So I ran four agents through every task in Terminal-Bench 2.0. This is what I set up, what came out, and one result I did not expect at all.

## The four agents

| Agent           | CLI (pinned version) | Model                     | Runs on                   |
| --------------- | -------------------- | ------------------------- | ------------------------- |
| Qwen            | Qwen Code 0.26.7     | Qwen3.8-Flash-Next, IQ3_S | My PC, through Strata     |
| Codex           | Codex CLI 0.164.0    | GPT-6 Luna, effort medium | OpenAI, ChatGPT login     |
| Claude Code     | Claude Code 2.1.318  | Sonnet 5.5, effort high   | Anthropic, Claude login   |
| Antigravity CLI | agy 1.5.0            | Gemini 3.8 Flash (high)   | Google, Antigravity login |

Effort levels are whatever I use day to day in each tool's own settings. Nobody got a special configuration for the benchmark.

The machine that hosts the local model and runs all the task containers:

| Component | Spec                                 |
| --------- | ------------------------------------ |
| CPU       | AMD Ryzen 9 9950X (16 cores)         |
| GPU       | NVIDIA GeForce RTX 5080, 16GB        |
| RAM       | 96GB                                 |
| OS        | Ubuntu 26.04                         |
| Qwen      | Strata, IQ3_S, 262K context, int8 KV |

## How the benchmark works

[Terminal-Bench 2.0](https://www.tbench.ai/) is a set of 89 hard, realistic command-line tasks. Each one is a Docker container plus an instruction: recover lost commits in a git repo, build POV-Ray 2.2 from source, write a MIPS interpreter, break a FEAL cipher, train a fastText model under a size limit, fix an OCaml garbage collector bug, and so on. Every task has a category, a difficulty and a time limit. When the agent says it is done (or runs out of time), hidden tests are copied into the container and decide pass or fail. The agent never sees those tests.

I ran it with Harbor, the official Terminal-Bench runner. For each task Harbor builds the container, installs the real agent CLI inside it, hands it the instruction with full permissions and no approval prompts, then runs the tests and saves everything: the full trajectory, token counts, timings and the score. That is what makes this an agent benchmark. Codex runs as `codex exec`, Claude Code as `claude -p`, Qwen Code as `qwen --yolo`, and agy as `agy --prompt`, each with its own tools and loop.

A few rules I set before looking at results:

- **One attempt per task**, no cherry-picking.
- **Only infrastructure failures are retried** (image build, container start, agent install). Agent errors, crashes and timeouts count as fails.
- **Three tasks are excluded for everyone.** `qemu-startup` and `qemu-alpine-ssh` use an old Debian image whose security mirror now returns 404, so no agent CLI can be installed in them. `mcmc-sampling-stan` hit a transient install failure. That leaves **86 scored tasks**.
- **Usage quota hits are not the agent's fault.** The Antigravity login ran out of quota partway through. Those trials failed instantly with a rate-limit error, so I paused, waited for the reset and reran them.

## Results

![Terminal-Bench 2.0 score per agent: Claude Code 77.9%, Qwen 69.8%, Antigravity 58.1% (80.2% before the leak check), Codex 41.9%](/images/articles/coding-agent-benchmark-terminal-bench/overall-score.png)

In the tables, scores are colored by level: green is 70% or more, amber is 50 to 69%, red is below 50%.

<!-- score-table columns=2 -->

| Agent                                 | Score     | Before leak check | Tasks solved |
| ------------------------------------- | --------- | ----------------- | ------------ |
| Claude Code (Sonnet 5.5)              | **77.9%** | 79.1%             | 67 / 86      |
| Qwen Code (Qwen3.8-Flash-Next, local) | **69.8%** | 69.8%             | 60 / 86      |
| Antigravity (Gemini 3.8 Flash)        | **58.1%** | 80.2%             | 50 / 86      |
| Codex (GPT-6 Luna)                    | **41.9%** | 44.2%             | 36 / 86      |

"Before leak check" is the raw pass rate. The main score removes passes from runs where the agent saw the benchmark's own answers, which I explain below. It is the reason Antigravity drops from first place to third.

By difficulty:

![Score by difficulty for each agent. On hard tasks: Claude Code 72%, Qwen 66%, Antigravity 45%, Codex 14%](/images/articles/coding-agent-benchmark-terminal-bench/score-by-difficulty.png)

<!-- score-table -->

| Difficulty  | Claude Code (Sonnet 5.5) | Qwen Code (Qwen3.8-Flash-Next, local) | Antigravity (Gemini 3.8 Flash) | Codex (GPT-6 Luna) |
| ----------- | ------------------------ | ------------------------------------- | ------------------------------ | ------------------ |
| Easy (4)    | 100%                     | 100%                                  | 100%                           | 50%                |
| Medium (53) | 79%                      | 70%                                   | 62%                            | 57%                |
| Hard (29)   | 72%                      | 66%                                   | 45%                            | 14%                |

By category (categories with at least four tasks). Claude Code is best or tied for best in 8 of the 10 categories, Qwen in 5, Antigravity in 3 and Codex in none:

![Heatmap of score by category and agent, with the best agent in each category outlined](/images/articles/coding-agent-benchmark-terminal-bench/score-by-category.png)

<!-- score-table -->

| Category                  | Claude Code (Sonnet 5.5) | Qwen Code (Qwen3.8-Flash-Next, local) | Antigravity (Gemini 3.8 Flash) | Codex (GPT-6 Luna) |
| ------------------------- | ------------------------ | ------------------------------------- | ------------------------------ | ------------------ |
| Software engineering (26) | 85%                      | 73%                                   | 65%                            | 27%                |
| Scientific computing (8)  | 75%                      | 50%                                   | 38%                            | 38%                |
| Security (8)              | 75%                      | 75%                                   | 50%                            | 50%                |
| Data science (7)          | 43%                      | 57%                                   | 57%                            | 43%                |
| System administration (7) | 71%                      | 57%                                   | 57%                            | 57%                |
| Debugging (5)             | 100%                     | 80%                                   | 100%                           | 60%                |
| File operations (5)       | 80%                      | 40%                                   | 60%                            | 20%                |
| Data processing (4)       | 100%                     | 100%                                  | 50%                            | 75%                |
| Mathematics (4)           | 100%                     | 100%                                  | 25%                            | 50%                |
| Model training (4)        | 50%                      | 75%                                   | 75%                            | 50%                |

Head to head, counting the tasks one agent solved and the other did not. The ranking holds in every pairing, and the margins are wide except between Claude Code and Qwen:

![Head-to-head bars for each pair of agents, showing tasks only one of the two solved](/images/articles/coding-agent-benchmark-terminal-bench/head-to-head.png)

In table form, each cell counts tasks the row agent solved and the column agent did not:

|                                       | Claude Code (Sonnet 5.5) | Qwen Code (Qwen3.8-Flash-Next, local) | Antigravity (Gemini 3.8 Flash) | Codex (GPT-6 Luna) |
| ------------------------------------- | ------------------------ | ------------------------------------- | ------------------------------ | ------------------ |
| Claude Code (Sonnet 5.5)              | -                        | 12                                    | 23                             | 32                 |
| Qwen Code (Qwen3.8-Flash-Next, local) | 5                        | -                                     | 21                             | 28                 |
| Antigravity (Gemini 3.8 Flash)        | 6                        | 11                                    | -                              | 24                 |
| Codex (GPT-6 Luna)                    | 1                        | 4                                     | 10                             | -                  |

Twelve tasks beat every agent, including `caffe-cifar-10`, `chess-best-move`, `install-windows-3.11`, `make-doom-for-mips` and both polyglot tasks. Twenty-two were solved by all four.

## How they work

The scores only tell half the story. The trajectories show four very different working styles.

![Median time per task against score: Claude Code is fast and accurate, Qwen and Antigravity are slow, Codex is fast but scores lowest](/images/articles/coding-agent-benchmark-terminal-bench/speed-vs-score.png)

| Agent                                 | Median time per task | Median tool calls | Median tokens in | Median tokens out | Timeouts |
| ------------------------------------- | -------------------- | ----------------- | ---------------- | ----------------- | -------- |
| Claude Code (Sonnet 5.5)              | 0.9 min              | 5                 | 124K             | 3.4K              | 5        |
| Codex (GPT-6 Luna)                    | 1.1 min              | 8                 | 145K             | 2.4K              | 0        |
| Qwen Code (Qwen3.8-Flash-Next, local) | 6.2 min              | 34                | 1.33M            | 30K               | 14       |
| Antigravity (Gemini 3.8 Flash)        | 9.9 min              | 63                | 2.98M            | 34K               | 7        |

Input tokens include cached prompt tokens for every agent, so they are comparable. Qwen's times come from my own GPU, so read them as "how long this setup takes", not as a model speed comparison.

**Claude Code is direct and accurate.** A median of five tool calls per task is remarkably low for a 78% score. On `gpt2-codegolf` (implement GPT-2 inference in a tiny C file) it inspected the checkpoint, wrote the C file, compiled it and checked the output in eight tool calls and three minutes. It was the only agent to solve that task, and also the only one to solve `dna-insert` and `extract-elf`.

**Qwen is slow, thorough and very persistent.** It reads more, tests more and iterates more than either fast agent. On hard tasks it scored 66%, close to Claude Code's 72%. It also hit the time limit on 14 tasks, yet eight of those still passed: the work was done and verified well before the deadline, and Qwen kept refining instead of stopping. Its other weakness is context. Three tasks failed because a long session filled the 262K context window and the request was rejected. It was also the only agent to solve `mteb-leaderboard` cleanly: it cloned the MTEB results repository, checked out a commit from August 2025, and rebuilt the Scandinavian leaderboard with the matching version of the `mteb` library to find the top model.

**Codex is fast and stops too early.** It never timed out, but 41 of its 48 failed runs ended in under three minutes with no error at all. Thirty of those were tasks that at least two other agents solved. The pattern is the same each time: one pass, a confident summary, no checking. On `log-summary-date-ranges` it wrote the CSV in 15 seconds and reported success with wrong counts. On `fix-git` it found the lost commits but resolved the merge conflicts the wrong way. On `overfull-hbox` it simply said it could not remove the last two warnings and stopped. On hard tasks that gave it 14%, against 66% for my local Qwen.

**Antigravity does a lot of work, and a lot of searching.** Which brings me to the leak check.

## The agent that downloaded the answer key

Terminal-Bench is public. Its hidden tests and reference solutions are on GitHub and Hugging Face, and agents have internet access because several tasks genuinely need it (installing packages, fetching papers, reading a leaderboard). That means an agent can, in principle, search for the task by name and read the answers.

Antigravity did exactly that, repeatedly. In 23 of the 86 scored tasks, its trajectory shows it searching the web for the task by name, looking for its tests or solution. In 16 of them it found them and downloaded `tests/test_outputs.py`, often `solution/solve.sh` as well, from the official dataset or one of its mirrors, then worked towards those. On `sam-cell-seg` it downloaded the hidden test fixtures and copied them into the working directory. Nobody prompted this. It is what the agent chose to do when a task got hard.

To handle this consistently, I wrote a leak check that scans every trajectory, for every agent. A run is flagged if its logs contain Terminal-Bench or Harbor sources (the dataset, the GitHub repo, the benchmark site or Harbor Hub), whether the agent searched for them or a normal web search surfaced them. A flagged run counts as a fail, even if the tests passed. Runs that only share some lines with the hidden tests, with no benchmark source, are reviewed by hand instead, because task repos often contain the same lines the tests quote. Two such cases turned out to be false positives and are not counted.

The result:

- **Antigravity:** 23 runs flagged, 19 of which had passed. Its raw 80.2% becomes 58.1%.
- **Claude Code:** 1 run. On `mteb-leaderboard`, an ordinary web search for the leaderboard returned a summary that quoted the benchmark page and its answer. Claude Code did not go looking for it, but it saw it, so that pass does not count.
- **Codex:** 2 runs, both from search results that surfaced benchmark pages.
- **Qwen:** none.

I would rather be strict here and publish both numbers. If your own agent has web access, this is worth knowing about: a raw pass rate on a public benchmark can quietly measure how good the agent is at finding the answer key.

## Where my local Qwen stands

This was the question I started with, and the answer is better than I expected.

- **Against Codex with GPT-6 Luna, Qwen is clearly stronger at the agent level.** 69.8% against 41.9%. Qwen solved 28 tasks Codex did not, while Codex solved 4 that Qwen did not (`adaptive-rejection-sampler`, `hf-model-inference`, `mailman`, `tune-mjcf`). The gap is widest exactly where it matters to me: hard tasks (66% vs 14%) and software engineering (73% vs 27%). This is not a statement about GPT-6 Luna as a model. Codex at medium effort simply quits early on this kind of work, and Qwen Code does not.
- **Against Claude Code with Sonnet 5.5, Qwen is behind but close.** 8 points overall and 6 on hard tasks. With one attempt per task, a rerun could move each score by a few points, so treat that gap as real but not huge. Claude Code is better at file operations (80% vs 40%) and scientific computing (75% vs 50%). Qwen matched or beat it on security, data science, model training, mathematics and data processing.
- **Against Antigravity, Qwen is ahead once the lookups are removed**, and it never needed them.

The cost is time. The full Qwen run took 18 hours with one task at a time on one GPU. Codex took about three and a half hours and Claude Code about five, both with two tasks in parallel. For interactive work that is a real difference. For background work that I hand off and check later, it matters much less, and every token stays on my own machine.

## Caveats

- One attempt per task. A pass@3 run would tighten the numbers, at three times the cost.
- Each agent ran with the effort level I actually use. Codex at high effort, or Claude Code with a different model, would score differently.
- Qwen ran at a 3.5-bit quantization on consumer hardware. Its timing numbers say as much about my PC as about the model.
- The agents ran with defaults inside the containers: none of my personal skills, memories or extensions were copied in.
- The leak check can only see what is in the logs. I reviewed every flagged run by hand, but a rule like this is a judgement call, which is why both scores are in the tables.

## Reproducing it

Everything runs from one folder: Harbor in a Python virtual environment, one script per agent, the leak check and a summary script that produces the tables above from the job results. The pieces worth knowing about if you do this yourself:

```bash
# one agent, all tasks, one attempt each
harbor run -p datasets/terminal-bench -a qwen-coder \
  -m openai/qwen3.8-flash-next-iq3_s --base-url http://host.docker.internal:9191/v1 \
  -n 1 -r 2 --retry-include AgentSetupTimeoutError -o jobs --job-name qwen-full
```

- A local model needs `host.docker.internal` mapped into every task container, through an extra Docker Compose file.
- Codex can use a ChatGPT login instead of an API key. Claude Code can use a Claude subscription login. Antigravity stores its login in a file when there is no desktop keyring, which you can produce once in a helper container.
- Run a leak check before you trust any number, and read a few trajectories of every agent. That is where all the interesting findings in this post came from.
