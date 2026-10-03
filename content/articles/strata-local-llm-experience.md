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

Two sets of numbers here: Strata's own published benchmark for IQ3_S (measured by the project on an RTX 5070, 12GB), and what I actually measured on my RTX 5080 16GB, in the exact configuration I run day to day (128K context, vision on, engine 0.1.38).

**Published (RTX 5070 12GB, Ryzen 5 7600, text-only, from Strata's docs):**

| Context | Prompt processing |     Output |
| ------- | ----------------: | ---------: |
| 1K      |         427 tok/s | 52.4 tok/s |
| 4K      |         913 tok/s | 53.3 tok/s |
| 32K     |       1,624 tok/s | 48.3 tok/s |
| 64K     |       1,640 tok/s | 46.3 tok/s |
| 128K    |       1,443 tok/s | 45.5 tok/s |

**Measured on my RTX 5080 16GB, vision on, 128K context, engine 0.1.38:**

| Prompt size                            | Prompt processing |     Output | Expert cache hit rate |
| -------------------------------------- | ----------------: | ---------: | --------------------: |
| 70 tokens (cold)                       |        66.8 tok/s | 21.7 tok/s |                     – |
| 7,443 tokens (cold)                    |     2,007.1 tok/s | 31.5 tok/s |                     – |
| 59 tokens, real session                |        28.0 tok/s | 22.8 tok/s |                 75.8% |
| 1,194 tokens, real session (1,140 new) |       484.9 tok/s | 27.0 tok/s |                 77.6% |

And for comparison, real coding-agent sessions from before I turned vision on (text-only, 65,536 context, engine 0.1.34), where the expert cache had the full 3,775 slots to work with:

| Prompt size (reused + new)                | Prompt processing (new tokens) |     Output | Expert cache hit rate |
| ----------------------------------------- | -----------------------------: | ---------: | --------------------: |
| 47,011 tokens (44,666 reused + 2,345 new) |                    900.1 tok/s | 35.7 tok/s |                 57.8% |
| 48,134 tokens (47,006 reused + 1,128 new) |                    456.9 tok/s | 40.0 tok/s |                 58.9% |
| 49,363 tokens (48,129 reused + 1,234 new) |                    501.8 tok/s | 34.9 tok/s |                 63.8% |

The pattern is consistent with what Strata's own warning said it would be: vision plus a long context measurably costs output speed on a 16GB card, roughly a 25 to 40 percent drop in my own numbers, because the expert cache has fewer slots to fill. Prompt processing on a fresh, long prompt is still very fast (2,000+ tok/s on a 7.4K-token prompt), and prompt reuse for a growing conversation is where the real win shows up: a 49K-token session only had to read 1,234 new tokens because the rest stayed cached.

## Using it with coding agents

The reason I care about any of this is daily use, not a synthetic benchmark. I pointed both my Pi coding agent and my Hermes Agent setup at this server over its OpenAI-compatible API, and both worked without any special-casing: same base URL, any API key, model name ignored by the server anyway. No prompt rewriting, no adapter layer.

## Where this leaves me

I am not going to pretend a 3.5-bit quantized 125B model on a single 16GB card matches a frontier API model on hard reasoning. It does not, and that is not the comparison I am making. The comparison is against every other local setup I have run on this exact PC, and on that measure Strata is the first one I have trusted enough to leave running as a default rather than a demo. It survived an engine update without drama, it took a 128K context change and a vision toggle without reinstalling anything, it told me honestly when I pushed the VRAM too far instead of silently stalling, and it held up under two different coding agents without modification.

That combination, not any single benchmark number, is why it is staying on.
