---
title: 'Running Qwen3.8-Flash-Next locally with Strata: 128K context, vision, and real benchmark numbers'
slug: 'strata-local-llm-experience'
description: 'Notes from running Strata on my own workstation: updating the engine, pushing context to 128K, turning on vision, and the real throughput numbers I measured on an RTX 5080.'
date: '2026-10-03'
category: 'AI Engineering'
tags:
  - local-llm
  - strata
  - qwen
  - nvidia
  - benchmark
  - self-hosted-ai
status: 'published'
author: 'Rifan Fauzi'
---

I have tried a fair number of local LLM setups on this PC: different quantizations, different runtimes, different coding-agent harnesses. [Strata](https://github.com/Niko1221/Strata) is the first one I have kept running for daily work instead of going back to a cloud model out of impatience. This is a note on what running it actually looked like, including the benchmark numbers, not just the pitch.

## The machine

Strata runs on the Windows workstation I built earlier this year for local AI and development.

| Component | Spec                                |
| --------- | ----------------------------------- |
| CPU       | Intel Core i7-14700 (AVX2)          |
| GPU       | NVIDIA GeForce RTX 5080, 16GB GDDR7 |
| RAM       | 128GB                               |
| Storage   | 2TB NVMe SSD                        |
| OS        | Windows                             |

That is a 16GB card, not the 24GB+ card the heavier local-model crowd usually assumes. The 128GB of RAM is what makes a 125B-parameter model realistic here at all, since most of the experts live in system RAM and only the active ones get pulled onto the GPU.

## What Strata actually is

Strata is a local serving engine for **Qwen3.8-Flash-Next**, a 125-billion-parameter mixture-of-experts model, built to run on a single consumer GPU plus system RAM instead of a multi-GPU server. The trick is that a MoE model does not need every expert for every token, so Strata keeps the full set of experts in RAM, caches the frequently used ones on the GPU, and streams the rest over PCIe as the model routes tokens to them. It exposes an OpenAI-compatible API and an Anthropic-compatible one, plus a small web chat, so it drops into existing tooling without custom glue code.

I run the **IQ3_S** quantization: a 3.5-bit i-quant that the project describes as matching the full model's published benchmarks, at the cost of being the slowest of the supported sizes. On this PC it uses about 50GB of RAM for the experts.

## Updating the engine

Before I did any of the tuning below, I pulled whatever had landed upstream since I first installed it. My copy was 96 commits behind, spanning four engine releases (0.1.34 to 0.1.38). The part worth flagging is that this was not just performance tuning: the update included a Host-header check against DNS rebinding and a rule that refuses cross-site browser requests when no API key is set. I run this server with `host: 0.0.0.0` so I can reach it from other devices on my network, so those two fixes mattered to me specifically, not just as changelog noise.

The update itself is one command once the repo is pulled:

```bash
python setup.py --update
```

It re-checked Python packages, downloaded the newer ready-made engine build, and left the model files and my existing configs alone. No re-download of the 84GB model, no re-answering the setup wizard.

## Pushing context to 128K

The default the installer picked for me was 65,536 tokens. With 128GB of RAM sitting mostly idle, there was no real reason to stay there. Strata streams the KV cache: above 64K context, the attention window lives in VRAM while the bulk of the cache lives in pinned system RAM, so a longer context is mostly a RAM cost, not a VRAM one. Going to 131,072 tokens (128K) added about 1.7GB of RAM on top of what 64K already used. Changing `--max-context` in the model's config and restarting was the whole change.

The model's trained context tops out at 262,144 tokens, and Strata will go past that with RoPE scaling if asked. I stopped at 128K because it is the officially supported ceiling for IQ3_S without scaling tricks, and it already covers anything a coding session throws at it.

## Turning on vision

Strata can optionally load an image encoder so the model reads pictures as well as text. It is not on by default because it costs VRAM and bandwidth you might want for the expert cache instead. I turned it on anyway:

```bash
python setup.py --setup --vision yes --model IQ3_S
```

That downloaded a 0.91GB vision encoder and wired it into the existing config. It did come with a real trade-off I want to be honest about: on a 16GB card, running vision plus a 128K context at the same time leaves very little VRAM to spare. Strata's own startup log told me so directly:

```
strata serve: 194 MiB of VRAM free with everything loaded - LOW: requests may stall;
add --vram-reserve-mib 1018 to the config's args (or lower --max-context)
```

The expert cache shrank from 3,775 resident experts (text-only, 64K context) to 3,145 (vision on, 128K context) to make room. That shows up directly in decode speed, which I measured below. If you only need vision occasionally, it is worth weighing against just keeping a second, text-only config around and switching between them, which is exactly what the install does by default: `run-iq3_s.bat` and a vision-enabled variant can coexist as separate configs on the same model files.

## Benchmark numbers

I did not want to leave the vision cost as a vague impression, so I ran a controlled A/B on my own machine: the exact same config, the exact same five prompt sizes, with vision on and then with vision off, both at 128K context. Then I added Strata's own published numbers and real coding-agent sessions as outside reference points.

### Vision on vs off, same machine, same context, same prompts

Both runs used engine 0.1.38, 131,072-token context, identical randomly generated prompts (so nothing was cached from a previous run), capped at 64 completion tokens.

| Prompt tokens | Output, vision off | Output, vision on | Output difference | Cache hit, vision off | Cache hit, vision on |
| ------------: | -----------------: | ----------------: | ----------------: | --------------------: | -------------------: |
|           259 |         25.2 tok/s |        30.0 tok/s |            noise¹ |                 60.2% |                43.7% |
|         1,058 |         39.6 tok/s |        36.9 tok/s |       6.8% slower |                 75.1% |                65.7% |
|         4,157 |         47.1 tok/s |        39.6 tok/s |      15.9% slower |                 81.5% |                72.6% |
|        15,231 |         58.5 tok/s |        40.7 tok/s |      30.4% slower |                 85.6% |                81.0% |
|        30,593 |         79.0 tok/s |        55.3 tok/s |      30.0% slower |                 90.5% |                86.1% |

¹ The 259-token row is the first request right after each cold start, before either run had warmed its expert cache; I would not read anything into vision coming out faster there.

Prompt processing speed was effectively identical between the two runs (within 1 to 3 percent at every size), so raw GPU throughput is not what vision costs you. What it costs you is expert cache room, and the gap grows with the prompt: by 15K to 30K tokens, vision-on decode is running about 30 percent slower, with a cache hit rate consistently 4 to 9 points lower at every size.

The reason is VRAM, not compute. Same 128K context, same card, two different expert cache sizes at startup:

| Config           | Expert cache | VRAM used | VRAM free at load | Startup warning           |
| ---------------- | -----------: | --------: | ----------------: | ------------------------- |
| Vision off, 128K |  3,674 slots |  7.03 GiB |           529 MiB | none                      |
| Vision on, 128K  |  3,145 slots |  6.02 GiB |           194 MiB | "LOW: requests may stall" |

Loading the image encoder on top of a 128K context leaves the expert cache 529 slots smaller, about 14 percent, on a 16GB card. That is the entire story behind the decode gap above.

One more thing worth noting: output speed climbed with prompt size in both runs (25 to 79 tok/s for vision-off, 30 to 55 tok/s for vision-on), which is the opposite of what I expected going in. The expert cache hit rate climbed right alongside it, from 60 percent up to 90 percent for vision-off. My read is that a longer prompt touches more of the model's experts during the prompt-processing pass, which pre-warms the cache for whatever the model then uses while generating, so the shortest prompt is actually the worst case for decode speed, not the longest one.

### Strata's published benchmark, for outside reference

Strata publishes its own IQ3_S numbers, measured on an RTX 5070 (12GB), text-only:

| Context | Prompt processing |     Output |
| ------- | ----------------: | ---------: |
| 1K      |         427 tok/s | 52.4 tok/s |
| 4K      |         913 tok/s | 53.3 tok/s |
| 32K     |       1,624 tok/s | 48.3 tok/s |
| 64K     |       1,640 tok/s | 46.3 tok/s |
| 128K    |       1,443 tok/s | 45.5 tok/s |

My vision-off numbers above land in the same range as these despite a different GPU, which is a reasonable sanity check that the A/B test above was measuring vision and nothing else.

### Real coding-agent sessions

The synthetic A/B above used fresh, uncached prompts on purpose, to isolate vision cleanly. A real coding session looks different because most of the context is reused turn to turn. These are from actual sessions before I turned vision on (text-only, 65,536 context, engine 0.1.34):

| Prompt size (reused + new)                | Prompt processing (new tokens) |     Output | Expert cache hit rate |
| ----------------------------------------- | -----------------------------: | ---------: | --------------------: |
| 47,011 tokens (44,666 reused + 2,345 new) |                    900.1 tok/s | 35.7 tok/s |                 57.8% |
| 48,134 tokens (47,006 reused + 1,128 new) |                    456.9 tok/s | 40.0 tok/s |                 58.9% |
| 49,363 tokens (48,129 reused + 1,234 new) |                    501.8 tok/s | 34.9 tok/s |                 63.8% |

A 49K-token session only had to freshly read 1,234 tokens because the rest stayed cached from the previous turn. That reuse is where a long-context local server actually earns its keep in a coding agent loop: the expensive part of a growing conversation only happens once.

## Using it with coding agents

The reason I care about any of this is daily use, not a synthetic benchmark. I pointed both my Pi coding agent and my Hermes Agent setup at this server over its OpenAI-compatible API, and both worked without any special-casing: same base URL, any API key, model name ignored by the server anyway. No prompt rewriting, no adapter layer.

## Where this leaves me

I am not going to pretend a 3.5-bit quantized 125B model on a single 16GB card matches a frontier API model on hard reasoning. It does not, and that is not the comparison I am making. The comparison is against every other local setup I have run on this exact PC, and on that measure Strata is the first one I have trusted enough to leave running as a default rather than a demo. It survived an engine update without drama, it took a 128K context change and a vision toggle without reinstalling anything, it told me honestly when I pushed the VRAM too far instead of silently stalling, and it held up under two different coding agents without modification.

That combination, not any single benchmark number, is why it is staying on.
