---
title: 'A local DeepSeek-V4.1-Flash joins my coding agent benchmark, and finishes fourth of five'
slug: 'local-deepseek-agent-benchmark'
description: 'I ran DeepSeek-V4.1-Flash on my own GPUs through the software engineering tasks of Terminal-Bench 2.0 and compared it with local Qwen, Claude Code, Antigravity and Codex. It solved half of them, and nothing my local Qwen did not.'
date: '2026-11-11'
category: 'AI Engineering'
tags:
  - ai-agents
  - benchmark
  - terminal-bench
  - local-llm
  - deepseek
  - qwen
status: 'published'
author: 'Rifan Fauzi'
---

In the [last benchmark](/articles/coding-agent-benchmark-terminal-bench) my local Qwen agent finished second, behind Claude Code and ahead of Antigravity and Codex. Since then my local AI server has been running DeepSeek-V4.1-Flash, a much larger model, and the obvious question was whether it would do even better.

It did not. On the software engineering tasks of Terminal-Bench 2.0 it solved 50%, against 73% for my local Qwen and 82% for Claude Code. It still beat Codex comfortably, and the way it failed turned out to be more interesting than the score.

## What I ran

Same benchmark, same runner (Harbor), same rules as last time: one attempt per task, only infrastructure failures retried, and every trajectory scanned for benchmark lookups. Two things changed.

**Only the software engineering category.** It is the largest category (26 of the 86 scored tasks) and the one I care most about. A full run of a local model takes most of a day, and this was enough to answer the question.

**Same agent, different model.** DeepSeek ran inside the exact same agent as Qwen: Qwen Code 0.26.7, pointed at a different local server. That keeps the comparison at the agent level, like the last post, and isolates the model. It also means Qwen plays at home, which I come back to below.

| Agent                      | CLI                 | Model                      | Runs on           |
| -------------------------- | ------------------- | -------------------------- | ----------------- |
| Qwen Code (DeepSeek, new)  | Qwen Code 0.26.7    | DeepSeek-V4.1-Flash, ~2bpw | My server, Strata |
| Qwen Code (Qwen, last run) | Qwen Code 0.26.7    | Qwen3.8-Flash-Next, IQ3_S  | My PC, Strata     |
| Claude Code (last run)     | Claude Code 2.1.318 | Sonnet 5.5, effort high    | Anthropic         |
| Antigravity CLI (last run) | agy 1.5.0           | Gemini 3.8 Flash (high)    | Google            |
| Codex (last run)           | Codex CLI 0.164.0   | GPT-6 Luna, effort medium  | OpenAI            |

I did not rerun the other four. Their results come from the runs in the last article.

### The DeepSeek setup

| Component | Spec                                                 |
| --------- | ---------------------------------------------------- |
| CPU       | AMD Ryzen 9 9950X (16 cores)                         |
| GPU       | 2x NVIDIA GeForce RTX 3090, 24GB each, tensor-split  |
| RAM       | 96GB                                                 |
| Engine    | Strata, 262K context, dspark speculative decoding    |
| Model     | DeepSeek-V4.1-Flash, "GSQ-RCO Coder" build, 280B MoE |

The model does not fit on the GPUs. Strata keeps the most-used experts in VRAM (35.9GB), copies the rest into RAM (37.7GB) and reads the 110GB Engram memory file from the NVMe drive on demand. That sounds slow, but Engram is a sparse lookup: in practice it reads about 6MB/s in tiny blocks and the drive stays under 1% busy. Generation ran at a median of 52 tokens per second, close to what I measured for Qwen, while prompt processing was slower at around 520 tokens per second.

The part that matters most is the quantization. The file is labelled IQ2_XXS, but the main weights are a mix:

| Type    | Bits per weight | Share of main weights | Used for                         |
| ------- | --------------- | --------------------- | -------------------------------- |
| IQ1_M   | 1.75            | 49%                   | Expert layers, mostly early ones |
| IQ2_XXS | 2.06            | 34%                   | Expert layers, middle            |
| IQ2_XS  | 2.31            | 15%                   | Expert layers, later             |
| Q5_K    | 5.5             | 3%                    | Output head, sensitive tensors   |
| Q8_0    | 8.5             | under 1%              | Attention projections            |

That averages 2.06 bits per weight. Qwen ran at IQ3_S, about 3.4. DeepSeek is a much bigger model, squeezed roughly 40% harder.

### Why I stopped at 22 tasks

I stopped the run after 22 of the 26 tasks, during `torch-pipeline-parallelism`. The interrupted task is not counted, and the scores below compare all five agents on the same 22 tasks. The decision was easy: Qwen had already solved 16 of those 22, against 11 for DeepSeek, so even a perfect finish on the last four would have left DeepSeek at 15 of 26, behind Qwen's 19. For reference, on all 26 software engineering tasks the other agents scored 85% (Claude Code), 73% (Qwen), 65% (Antigravity) and 27% (Codex).

## Results

![Software engineering score on 22 tasks: Claude Code 82%, Qwen 73%, Antigravity 68%, DeepSeek 50%, Codex 27%](/images/articles/local-deepseek-agent-benchmark/se-score.png)

<!-- score-table columns=2 -->

| Agent                                  | Score     | Before leak check | Tasks solved |
| -------------------------------------- | --------- | ----------------- | ------------ |
| Claude Code (Sonnet 5.5)               | **81.8%** | 81.8%             | 18 / 22      |
| Qwen Code (Qwen3.8-Flash-Next, local)  | **72.7%** | 72.7%             | 16 / 22      |
| Antigravity (Gemini 3.8 Flash)         | **68.2%** | 72.7%             | 15 / 22      |
| Qwen Code (DeepSeek-V4.1-Flash, local) | **50.0%** | 50.0%             | 11 / 22      |
| Codex (GPT-6 Luna)                     | **27.3%** | 31.8%             | 6 / 22       |

The leak check found nothing for DeepSeek. Its only trips to GitHub were for legitimate sources, such as the original GPT-2 code on `gpt2-codegolf`. Antigravity and Codex keep the flags from last time.

By difficulty:

![Score by difficulty for five agents. On hard tasks: Claude Code 80%, Antigravity 70%, Qwen 50%, DeepSeek 40%, Codex 0%](/images/articles/local-deepseek-agent-benchmark/se-by-difficulty.png)

<!-- score-table -->

| Difficulty | Claude Code (Sonnet 5.5) | Qwen Code (Qwen, local) | Antigravity (Gemini 3.8 Flash) | Qwen Code (DeepSeek, local) | Codex (GPT-6 Luna) |
| ---------- | ------------------------ | ----------------------- | ------------------------------ | --------------------------- | ------------------ |
| Easy (3)   | 100%                     | 100%                    | 100%                           | 100%                        | 67%                |
| Medium (9) | 78%                      | 89%                     | 56%                            | 44%                         | 44%                |
| Hard (10)  | 80%                      | 50%                     | 70%                            | 40%                         | 0%                 |

DeepSeek's biggest gap is on medium tasks, not hard ones. That is a clue, and the next section explains it.

Head to head, each cell counts tasks the row agent solved and the column agent did not:

|                             | Claude Code | Qwen (local) | Antigravity | DeepSeek (local) | Codex |
| --------------------------- | ----------- | ------------ | ----------- | ---------------- | ----- |
| Claude Code (Sonnet 5.5)    | -           | 3            | 4           | 8                | 12    |
| Qwen Code (Qwen, local)     | 1           | -            | 3           | 5                | 10    |
| Antigravity (Gemini 3.8)    | 1           | 2            | -           | 5                | 10    |
| Qwen Code (DeepSeek, local) | 1           | 0            | 1           | -                | 6     |
| Codex (GPT-6 Luna)          | 0           | 0            | 1           | 1                | -     |

The DeepSeek row is the summary of this post. It solved **no task that my local Qwen did not**, while Qwen solved five that DeepSeek missed. Its one win over Claude Code was `build-pov-ray` (building POV-Ray 2.2 from source), which Qwen and Antigravity also solved.

Every task, every agent:

![Pass and fail grid for 22 software engineering tasks and five agents, sorted by how many agents solved each task](/images/articles/local-deepseek-agent-benchmark/se-task-grid.png)

## How DeepSeek lost

Reading the failed trajectories, very few of them are the model not knowing how to do the work. They fall into three groups.

**It drifts from the exact spec.** On `kv-store-grpc` the instruction says the `SetValRequest` message has a field named `value`. DeepSeek named it differently, tested its server against its own client, reported "Verified", and failed the hidden test with `SetValRequest has no "value" field`. On `build-pmars` it built a working, headless pMARS from Debian's `.orig` source tarball, but the task asked for the Debian source package, and the test checks for its `debian/` folder: three of four tests passed. On `cancel-async-tasks` it wrote a correct concurrency-limited runner and passed five of six tests, missing the case where tasks still waiting in the queue get cancelled. Each time the core engineering was right and one stated detail was not.

**Its servers died when the agent exited.** Two tasks ask for a server left running in the background. DeepSeek started both with Qwen Code's built-in background shell tool, which ties the process to the agent session. When `qwen` exited, the server went with it, and the tests found nothing listening on the port. On the same tasks Qwen ran `nohup ... &`, which survives. DeepSeek had even installed a package from its own running PyPI server to check it. The check was real; it just did not survive the handover.

**It ran out of time.** Seven tasks hit their time limit, against two for Qwen on the same 22. These were not stalls. In every one, DeepSeek was still working when the clock ran out: refitting a renderer on `path-tracing-reverse`, re-testing a Scheme interpreter on `schemelike-metacircular-eval`, still matching chess positions on `regex-chess`. That last one passed anyway, because the work was finished before the deadline, the same thing I saw with Qwen last time. It reasons at length (over 500,000 characters of reasoning on `regex-chess` alone), and at around 50 tokens per second on my hardware, long reasoning costs real minutes.

The first two groups explain the weak medium score: medium tasks are the ones where getting the details exactly right is most of the work.

When it did succeed, it could be impressive. It solved `fix-ocaml-gc` (a bug in the OCaml garbage collector), `circuit-fibsqrt` and `path-tracing`, all hard, and it never searched for the benchmark's answers.

## Speed and effort

![Median time per task against score for five agents: Claude Code and Codex near one minute, Qwen, Antigravity and DeepSeek around ten minutes](/images/articles/local-deepseek-agent-benchmark/se-speed-vs-score.png)

| Agent                       | Median time per task | Median tool calls | Median tokens in | Median tokens out | Timeouts |
| --------------------------- | -------------------- | ----------------- | ---------------- | ----------------- | -------- |
| Claude Code (Sonnet 5.5)    | 0.9 min              | 7                 | 169K             | 3.9K              | 1        |
| Codex (GPT-6 Luna)          | 0.9 min              | 6                 | 104K             | 2.0K              | 0        |
| Qwen Code (Qwen, local)     | 8.6 min              | 38.5              | 1.84M            | 38.6K             | 2        |
| Qwen Code (DeepSeek, local) | 10.5 min             | 41.5              | 1.19M            | 16.2K             | 7        |
| Antigravity (Gemini 3.8)    | 11.5 min             | 70                | 4.06M            | 35.4K             | 2        |

DeepSeek works about as hard as Qwen (a similar number of tool calls), so this is not the Codex pattern of quitting early. The 22 tasks took six hours and forty minutes, one at a time. The two local runs were on different GPUs (an RTX 5080 for Qwen, two RTX 3090s for DeepSeek), so treat the timing as "what each setup takes", not a model speed comparison.

## Why the bigger model lost

I can see three reasons, and I cannot fully separate them with one run:

- **Quantization.** Half of DeepSeek's expert weights sit at 1.75 bits. Aggressive quantization tends to hurt exactly what these failures show: precise recall of a field name, an exact source format, an edge case. The overall approach survives; the details slip.
- **Home advantage.** Qwen Code is built and tuned around Qwen models: its system prompt, its tool descriptions and its tool habits. DeepSeek is a guest in that agent. The background-server failures look like a tool-usage habit more than a gap in knowledge.
- **Reasoning cost.** DeepSeek thinks longer per step, which costs time on hardware that generates at around 50 tokens per second, and seven timeouts were the result.

None of this says DeepSeek-V4.1-Flash is a weak model. It says that this build, at this quantization, inside this agent, on my hardware, is clearly behind my local Qwen for agentic coding.

## What I am keeping

Qwen stays my daily local agent. It scores higher, finishes faster and fits a single 16GB card. DeepSeek on my server is still the better local model than Codex for this kind of work (six tasks won against one), so it is not wasted, but I would not hand it a task where the exact wording of the spec matters and nobody checks the result.

The experiment I would like to run next is a higher-bit build of the same model. A roughly 3-bit version would need around 120GB for the main weights. After the 48GB of VRAM, that leaves about 80GB of experts for system RAM, which does not fit in 96GB next to the OS, the Engram cache and the task containers. That experiment waits for a memory upgrade.

## Caveats

- 22 of 26 software engineering tasks, one attempt each. With 22 tasks, one task is 4.5 points.
- Only one category. DeepSeek could rank differently on security or data science.
- DeepSeek ran at about 2 bits per weight. A higher-bit build would very likely score better.
- Both local models ran inside Qwen Code. A different agent CLI might suit DeepSeek better.
- The other four agents ran a week earlier. Their CLIs were pinned to the same versions, but cloud models can change behind the same name.

## Reproducing it

Same folder and scripts as the last article, plus a run script that points Qwen Code at the DeepSeek server and a task list for the software engineering category:

```bash
# software engineering tasks only (config/se-tasks.txt), one attempt each
SUBSET=se scripts/run_deepseek.sh --job-name deepseek-se

# leak check over all five jobs, then a report on the tasks every agent finished
python3 scripts/detect_leaks.py jobs/qwen-full jobs/codex-full jobs/claude-full jobs/agy-full jobs/deepseek-se
python3 scripts/summarize.py Claude=jobs/claude-full Qwen=jobs/qwen-full Agy=jobs/agy-full \
  Codex=jobs/codex-full DeepSeek=jobs/deepseek-se --out reports/se
```

If you put a different model behind the same agent, read a few failed trajectories before blaming the model. Two of DeepSeek's failures here came down to how it started a background process.
