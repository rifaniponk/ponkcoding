---
title: 'Seven local builds of one model on Aider Polyglot: file size did not predict the score'
slug: 'local-qwen-builds-aider-polyglot'
description: 'I ran seven Strata builds of Qwen3.8-Flash-Next through the same coding agent on 20 Aider Polyglot tasks, with Claude Code as a reference. The smallest build tied for first, the default build came fifth, and none of them came close to Claude.'
date: '2026-11-13'
category: 'AI Engineering'
tags:
  - ai-agents
  - benchmark
  - aider-polyglot
  - local-llm
  - strata
  - qwen
status: 'published'
author: 'Rifan Fauzi'
---

My [Strata](/articles/strata-local-llm-experience) install now has eight builds of local models on disk: the default IQ3_S I have used since October, a 2-bit build, an Unsloth build, a coder tune, two Gyro builds, a Swift tune and the DeepSeek build from the [last article](/articles/local-deepseek-agent-benchmark). They range from 58GB to 94GB. I wanted to know which one to keep loaded, and whether the bigger files are worth their extra RAM and load time.

The short answer: on this test, file size told me nothing about the score. The smallest build, Gyro-S, tied for first with the Swift tune at 11 of 20 tasks. My default IQ3_S solved 8. Claude Code, run as a reference on the same tasks, solved 16, in a fraction of the time.

## What I ran

**Benchmark.** [Aider Polyglot](https://github.com/Aider-AI/polyglot-benchmark): Exercism exercises in C++, Go, Java, JavaScript, Python and Rust, where the agent edits a stub and hidden tests decide pass or fail. I ran it through Harbor, the same runner as my Terminal-Bench articles.

**A 20-task subset, not all 225.** A full run of one local model takes most of a day, and I had seven to test. I picked 20 tasks, three or four per language, from the full runs of the frontier agents I did the day before: 6 that every frontier agent passed, and 14 where exactly one of them failed. I left out the tasks that every frontier agent failed, because they would not separate the local builds, and one task whose test setup is broken.

**Same agent for every local build.** Each build ran inside the same agent: dsh (DeepSeek Harness) 0.2.2-rc.1 with its headless profile, pointed at Strata on my machine. That keeps everything fixed except the model file.

**Same server settings.** Strata engine 0.1.59, 128K context, three requests at a time, MTP drafting, vision off. Each build was started, run through the 20 tasks three at a time, and stopped before the next one.

**Rules.** One attempt per task. Fifteen minutes per task, half of the task's own limit, because a local model that needs more than that is not one I would wait for. Trials broken by the harness or the network were rerun, not counted.

| Component | Spec                                               |
| --------- | -------------------------------------------------- |
| CPU       | AMD Ryzen 9 9950X (16 cores)                       |
| GPU       | 2x NVIDIA GeForce RTX 3090, 24GB each, layer split |
| RAM       | 96GB                                               |
| Engine    | Strata 0.1.59, 128K context, 3 parallel requests   |
| Agent     | dsh 0.2.2-rc.1 (local builds), Claude Code 2.1.323 |
| Tasks     | 20 Aider Polyglot tasks, one attempt, 15 min limit |

### The builds

All seven are the same architecture: Qwen3.8-Flash-Next, a mixture-of-experts model with 48 layers, 512 experts and 10 active per token. They differ in how the weights were quantized and, for two of them, in extra tuning.

| Build             | Model file | What it is                                               |
| ----------------- | ---------- | -------------------------------------------------------- |
| Qwen IQ3_S        | 83.6 GB    | The default build I have been using                      |
| Qwen Q2_0         | 66.4 GB    | 2-bit build from the same quantization pipeline          |
| Unsloth UD-IQ4_XS | 93.7 GB    | Unsloth's dynamic 4-bit quantization                     |
| Coder IQ1_M       | 58.4 GB    | Coder tune with half the experts removed (256 of 512)    |
| Gyro-S            | 58.5 GB    | Gyro build, small                                        |
| Gyro-M            | 92.0 GB    | Gyro build, medium                                       |
| Swift IQ3_S       | 83.7 GB    | Swift tune of the same model, same quantization as IQ3_S |

The reference was Claude Code 2.1.323 with Sonnet 5.5 at high effort, under the same 15-minute limit and the same lookup block (below), with its server-side web search turned off because the block cannot reach it. It is a different agent as well as a different model, so read it as "what a frontier setup does on these tasks", not as a model comparison.

### The DeepSeek build did not finish

I started an eighth run with the DeepSeek-V4.1-Flash build. It generated at about 18 tokens per second (it is the only build without MTP drafting here), 7 of its first 12 tasks hit the time limit, and a score made mostly of timeouts measures speed, not coding. I stopped it and left it out.

## Results

![Tasks solved out of 20: Claude Code 16, Gyro-S 11, Swift IQ3_S 11, Unsloth UD-IQ4_XS 10, Gyro-M 9, Qwen IQ3_S 8, Qwen Q2_0 7, Coder IQ1_M 5](/images/articles/local-qwen-builds-aider-polyglot/quick-score.png)

<!-- score-table columns=2 -->

| Build                    | Score     | Before leak check | Tasks solved | Model file |
| ------------------------ | --------- | ----------------- | ------------ | ---------- |
| Claude Code (Sonnet 5.5) | **80.0%** | 80.0%             | 16 / 20      | cloud      |
| Gyro-S                   | **55.0%** | 55.0%             | 11 / 20      | 58.5 GB    |
| Swift IQ3_S              | **55.0%** | 55.0%             | 11 / 20      | 83.7 GB    |
| Unsloth UD-IQ4_XS        | **50.0%** | 60.0%             | 10 / 20      | 93.7 GB    |
| Gyro-M                   | **45.0%** | 45.0%             | 9 / 20       | 92.0 GB    |
| Qwen IQ3_S (default)     | **40.0%** | 40.0%             | 8 / 20       | 83.6 GB    |
| Qwen Q2_0                | **35.0%** | 40.0%             | 7 / 20       | 66.4 GB    |
| Coder IQ1_M              | **25.0%** | 40.0%             | 5 / 20       | 58.4 GB    |

With 20 tasks, one task is five points, so the middle of this table is closer than it looks: Gyro-S at 11 and IQ3_S at 8 are three tasks apart. Two things are clear enough to act on. First, there is no pattern by file size: the smallest build tied for first, and the two largest landed third and fourth. Second, every local build is a long way behind Claude Code, which solved 6 tasks that Gyro-S missed, while Gyro-S solved one task that Claude missed (`forth` in Go).

By language, Claude solved every C++, JavaScript and Rust task. Among the local builds, Gyro-S and Unsloth solved all six JavaScript and Rust tasks, and no build solved more than one of the three C++ tasks.

![Pass and fail grid for 20 tasks and eight builds, sorted by how many builds solved each task](/images/articles/local-qwen-builds-aider-polyglot/quick-task-grid.png)

The grid shows the shape of the gap. The local builds agree on the easy tasks and fail the same hard ones. Four tasks were solved by Claude and by no local build: `crypto-square` and `meetup` in C++, `palindrome-products` in Go and `bowling` in Java. Two tasks (`zipper` in Java and `tree-building` in Python) beat everyone.

## Why the C++ tasks failed

Several local builds failed C++ tasks without a single test running: the test file did not compile. The cause is a quirk of the benchmark. The C++ stubs are empty namespaces, and the hidden tests expect a specific API. On `crypto-square` the test calls `crypto_square::cipher(text).normalized_cipher_text()`. Six of the seven builds guessed that there should be a `cipher` class, and then named its methods something else (`normalize_text`, for example). Q2_0 wrote a plain function that returns a string. Both are reasonable readings of the instructions, and neither compiles against the test. On `meetup` the test expects a `meetup::scheduler` class with one method per day and week, such as `monteenth()`. Five builds never created the class. Gyro-S and Swift did, but with a different constructor or different method names.

Claude passed both because it knows the Exercism C++ API from memory. That is a real advantage on this benchmark, and it is worth knowing when you read the scores: part of the gap is recall of a specific exercise's conventions, not general coding skill. On `zipper` Claude did the same thing in Java, and said so in its final message: it had to guess the expected print format "from memory of the Exercism Java exercise". That guess was wrong, and it failed.

## Benchmark lookups

Aider Polyglot exercises come from Exercism, and their tests and example solutions are public on GitHub. In my earlier full run, several agents downloaded them. This time I blocked GitHub and Exercism inside the container for the whole agent run (an `/etc/hosts` entry, removed again before the tests run, because the Java tests download Gradle through GitHub).

The habit did not go away. **79 of the 140 local trials tried to fetch the tests or solutions** and hit the block, between 9 and 14 trials for every build. Claude Code tried zero times. That difference is at least partly the agent, not only the model: all seven builds ran in dsh, and dsh reaches for `web_fetch` readily.

Seven trials got through anyway, through CDN mirrors of GitHub that my block did not cover (`jsdelivr.net/gh/exercism`, githack, statically.io). Those count as fails, the same rule as my earlier benchmarks: Coder IQ1_M lost 3 solved tasks this way and had one more failed task flagged, Unsloth lost 2 and Q2_0 lost 1. The blocked attempts are not counted, since they got nothing back. Next time the block list includes the mirrors.

## Speed

This was the part I most wanted for daily use. Generation speed comes from Strata's own per-request log; time per task is how long the agent worked on each task, tool calls and its own test runs included.

![Generation speed per request: Qwen Q2_0 173 tok/s, Gyro-S 146, Qwen IQ3_S 141, Swift IQ3_S 141, Gyro-M 135, Coder IQ1_M 131, Unsloth UD-IQ4_XS 123](/images/articles/local-qwen-builds-aider-polyglot/quick-tps.png)

| Build                    | Generation tok/s | Prompt read tok/s | Median time per task | Mean time per task | Median output tokens per task |
| ------------------------ | ---------------- | ----------------- | -------------------- | ------------------ | ----------------------------- |
| Qwen Q2_0                | **173**          | 1,281             | **2.6 min**          | **3.6 min**        | 9.2K                          |
| Gyro-S                   | 146              | 1,340             | 3.0 min              | 5.1 min            | 13.0K                         |
| Qwen IQ3_S               | 141              | 1,053             | 4.1 min              | 4.7 min            | 13.2K                         |
| Swift IQ3_S              | 141              | 1,117             | 5.3 min              | 5.7 min            | 15.4K                         |
| Gyro-M                   | 135              | 1,318             | 3.7 min              | 4.0 min            | 12.6K                         |
| Coder IQ1_M              | 131              | **1,446**         | 5.9 min              | 7.4 min            | 20.8K                         |
| Unsloth UD-IQ4_XS        | 123              | 625               | 4.8 min              | 5.5 min            | 14.7K                         |
| Claude Code (Sonnet 5.5) | cloud            | cloud             | 0.3 min              | 0.3 min            | 1.7K                          |

Generation speed is per request while three requests share the two GPUs, so a single chat session runs faster than these numbers.

A few things stand out:

- **Q2_0 is the fastest by every measure**, and it writes the fewest tokens per task. It also solves fewer tasks, so it is quick partly because it gives up sooner.
- **Gyro-S is the best balance.** Second fastest at generation, 3 minutes per task, and tied for the top score.
- **Unsloth reads prompts at half the speed of the others** (625 tok/s against 1,050 to 1,450). In an agent loop that re-reads a growing context every turn, that adds up.
- **Coder IQ1_M generates at a decent speed but is the slowest per task**, because it writes the most (20.8K tokens per task) and hit the time limit four times.
- **Claude Code took 18 seconds per median task.** It writes about 1.7K output tokens where the local builds write 9K to 21K. At 120 to 170 tokens per second, generating that much text alone takes one to three minutes per task.

![Median time per task against tasks solved: Claude Code at 0.3 minutes and 16 tasks, local builds between 2.6 and 5.9 minutes and 5 to 11 tasks](/images/articles/local-qwen-builds-aider-polyglot/quick-speed-vs-score.png)

## What I am keeping

Gyro-S replaces IQ3_S as my default local build. On this test it solved more tasks, finished a typical task faster (3.0 against 4.1 minutes median), and its model file is 25GB smaller, which leaves more room in RAM for everything else on the machine. Swift IQ3_S matched its score but took longer on a typical task (5.3 minutes median).

I would not read too much into the order of the middle five. Three tasks separate first from fifth among the local builds, and a second run would shuffle some of them. A full 225-task run of the top two is the obvious next step, and it now looks affordable: Gyro-S took 50 minutes for these 20 tasks, three at a time, so the full set would take around nine hours, one night.

The bigger lesson is the gap to Claude Code, 16 against 11 at best, at about a tenth of the time per task. A local build is good enough for routine work I can check myself. It is not yet the agent I would leave alone on a task where the exact API matters.

## Caveats

- 20 tasks, one attempt each. One task is five points, and differences of one to three tasks are within noise.
- The subset was picked using the frontier agents' earlier results. On the 18 of these tasks that its earlier full run finished, Claude solved 14 back then, so its 80% here is not an independent measurement.
- Claude Code and dsh are different agents. The local builds are compared fairly with each other; the Claude row is a reference point.
- The 15-minute limit is half of the task's own limit. It cost the slower builds some tasks (Coder IQ1_M hit it four times).
- All builds are quantized. The scores describe these files on this hardware, not the full-precision model.
- Lookups that got content count as fails; blocked attempts do not.

## Reproducing it

The scripts are in the same benchmark folder as the earlier articles:

```bash
# start each Strata build in turn, run the 20 tasks with dsh, stop it; reruns network-broken trials
MODELS="iq3_s q2_0 unsloth-iq4_xs coder-iq1_m gyro-s gyro-m swift-iq3_s" scripts/run_strata_quick.sh

# Claude Code reference on the same tasks and limits
scripts/run_claude_quick.sh

# leak check (only lookups that got content count), report, speed table
python3 scripts/detect_leaks.py --dataset aider-polyglot --blocked-hosts --out reports/aider-quick jobs/strata-aider-quick-* jobs/claude-aider-quick-sonnet-5-5
python3 scripts/summarize.py --dataset aider-polyglot --out reports/aider-quick gyro-s=jobs/strata-aider-quick-gyro-s ...
python3 scripts/speed_report.py --out reports/aider-quick gyro-s=jobs/strata-aider-quick-gyro-s ...
```

If you test local builds yourself, block the benchmark's sources from the start, including the CDN mirrors, and read a few failed trajectories before trusting the ranking. Two of the tasks here came down to whether the model remembered a class name.
