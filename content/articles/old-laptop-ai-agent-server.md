---
title: 'Turning an old laptop into a self-hosted AI agent server'
slug: 'old-laptop-ai-agent-server'
description: 'How I repurposed a 2013 laptop into a 24/7 AI agent server — full control, zero cloud cost, complete privacy.'
date: '2026-07-08'
category: 'AI Infrastructure'
tags:
  - self-hosted
  - ai-agents
  - linux
  - hermes
  - telegram-bot
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/ai-agent-server/cover.jpg'
---

Most developers have an old laptop gathering dust. Mine was a 2013-era machine — Intel Core i7-4500U (2 cores, 4 threads, Haswell), 16GB RAM, 238GB SSD. No AVX2, no AVX-512, no NPU. Local LLM inference is a non-starter. But it doesn't need to run models — it just needs to orchestrate an agent.

## The actual hardware

| Component | Spec                                                 |
| --------- | ---------------------------------------------------- |
| CPU       | Intel Core i7-4500U @ 1.80GHz (2C/4T, Haswell, 2013) |
| RAM       | 16GB DDR3                                            |
| Disk      | 238GB SSD                                            |
| GPU       | Intel HD Graphics 4400 (integrated)                  |
| AVX2      | No                                                   |
| AVX-512   | No                                                   |

## The stack (what's actually running)

```
┌─────────────────────────────────────────────────┐
│              Ubuntu Server 24.04 LTS                │
│         (headless, no desktop environment)       │
├─────────────────────────────────────────────────┤
│                   Tailscale                      │
│        (secure remote access, no port forwarding)│
├─────────────────────────────────────────────────┤
│              Hermes Agent                        │
│  (CLI, TUI, WebUI, Telegram Gateway, Cron)      │
├─────────────────────────────────────────────────┤
│         Development toolchain                    │
│  Node.js 22, npm 9, pnpm, GitHub CLI (gh),      │
│  ngrok, Netdata, Docker                         │
└─────────────────────────────────────────────────┘
```

- **OS:** Ubuntu Server 24.04 LTS, minimal install (no GUI, saves ~1GB RAM)
- **Remote access:** Tailscale — SSH from anywhere on tailnet
- **WebUI:** Ponkcoding site (Vite + React) served via dev server on Tailscale
- **Agent:** Hermes Agent — persistent memory, skills, cron, delegation, Telegram gateway
- **Git ops:** GitHub CLI (`gh`) — agent uses it for automated commits, pushes, PR creation, issue management
- **Monitoring:** Netdata — real-time system metrics (CPU, RAM, disk, network, processes) via Tailscale
- **Tunnels:** ngrok — temporary public URLs for testing webhooks, OAuth callbacks, mobile testing

## Development toolchain

| Tool            | Version | Purpose                              |
| --------------- | ------- | ------------------------------------ |
| Node.js         | 22.22.1 | JavaScript runtime                   |
| npm             | 9.2.0   | Package manager                      |
| pnpm            | latest  | Fast, disk-efficient package manager |
| GitHub CLI (gh) | 2.95.0  | GitHub API from terminal             |
| ngrok           | 3.39.9  | Secure public tunnels                |
| Netdata         | latest  | Real-time system monitoring          |
| Docker          | latest  | Container runtime                    |

## Model routing: Nemotron daily, OpenRouter for specifics

| Use Case                                    | Provider                  | Model                                                                       | Why                                       |
| ------------------------------------------- | ------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| Daily chat, reasoning, coding               | NVIDIA `build.nvidia.com` | `nvidia/nemotron-3-ultra-550b-a55b`                                         | Free tier, strong reasoning, 1000 req/day |
| Specialized tasks (vision, specific models) | OpenRouter                | `anthropic/claude-sonnet-4`, `google/gemini-2.5-pro`, `openai/gpt-4o`, etc. | Model variety, pay-per-use, fallback      |

Hermes config uses `openai_compatible` provider pointed at NVIDIA for daily use. For specific tasks, I switch to OpenRouter via `/model` command or delegate to subagents with different model configs.

## Telegram Gateway — my universal interface

The Hermes gateway runs as a Telegram bot (24/7). Only my user ID has admin access — wife @devinfortran and others can chat but no slash commands.

**Key commands:**

```
/status        # Server health, CPU/RAM, API status
/models        # List/switch models (Nemotron, OpenRouter models)
/cron          # List/trigger scheduled jobs
/memory        # Search/recall past conversations
/kanban        # Task board across projects
/skills        # Load/unload skills
/delegate      # Spawn parallel subagents
```

**Daily workflow:** Message the bot from bed, commute, or laptop — same agent, same memory, same tools. Cron jobs deliver summaries to the same chat.

## Resource reality

| Component | Usage                                                       |
| --------- | ----------------------------------------------------------- |
| RAM       | ~2-3GB / 16GB (OS + dev server + Hermes + minimal services) |
| CPU       | ~5-15% idle, spikes during builds                           |
| Disk      | ~10GB / 238GB                                               |

Headroom: ~13-14GB RAM free. No swap pressure. Fans barely spin.

## The actual setup

![Actual setup: Lenovo laptop running headless Ubuntu, tucked behind a router with power strip](/images/articles/ai-agent-server/actual-setup.jpg)

_The actual setup: a dusty Lenovo laptop running headless Ubuntu Server, tucked behind a router with a power strip. No monitor, no keyboard, no desk space needed. Just power, ethernet, and it runs 24/7._

## Future plans for this server

### 1. Personal research agent

- Automated literature review: feed it topics, get synthesized summaries with citations
- Monitor arXiv, blogs, GitHub for keywords; daily digest via Telegram
- Long-running research threads with persistent context across sessions

### 2. IHSG trading bot with AI signals

- Cron job pulls market data (IHSG, sector indices, portfolio positions) at market open/close
- Agent analyzes technicals, news sentiment, volume patterns → generates signal
- Telegram alert with entry/exit rationale, risk level, position sizing
- Paper trading first, then live with strict risk limits
- All logic auditable in Hermes memory — no black box

### 3. Automated dev workflows

- **Auto PR review:** Webhook triggers agent on new PR → reads diff, runs linters/tests, posts inline comments
- **Auto bug fix:** Issue labeled `auto-fix` → agent reproduces, proposes patch, creates PR
- **Dependency audit:** Weekly cron scans all repos for vulnerable/outdated deps, opens PRs with updates
- **Security scan:** SAST + dependency check on every push, summary in PR
- All workflows use delegation: orchestrator spawns leaf subagents per repo/task, aggregates results

---

The old machine sits silent in a drawer, fans barely spinning, serving as a lightweight orchestration box. Best $0 upgrade I've ever made.
