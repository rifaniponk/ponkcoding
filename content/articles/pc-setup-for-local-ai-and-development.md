---
title: 'My PC setup for local AI and development'
slug: 'pc-setup-for-local-ai-and-development'
description: 'A short note on the Windows PC I built for local AI experiments, development, Docker, WSL, VMs, and isolated Hermes Agent sandboxes.'
date: '2026-08-26'
category: 'AI Engineering'
tags:
  - pc-setup
  - local-ai
  - windows
  - nvidia
  - homelab
status: 'published'
author: 'Rifan Fauzi'
---

I built a new Windows PC as my main workstation for development and local AI experiments.

My old laptop server is still useful as an always-on machine for bots, cron jobs, dashboards, and automation. This PC has a different job: it is where I can run heavier, more interactive workloads without worrying too much about memory, GPU, or isolation.

## The build

| Component   | Spec                                   |
| ----------- | -------------------------------------- |
| CPU         | Intel Core i7-14700                    |
| GPU         | NVIDIA GeForce RTX 5080 16GB GDDR7     |
| Motherboard | ASRock B760M Pro RS/D4                 |
| RAM         | Team T-Force Delta RGB 128GB DDR4-3600 |
| SSD         | MSI Spatium M480 Pro 2TB               |
| PSU         | FSP VITA 850W Gold White               |
| CPU cooler  | DeepCool LM360 White ARGB              |
| Case        | DeepCool CH260 Digital White           |
| Case fans   | DeepCool FL12                          |
| Wireless    | MediaTek Wi-Fi + Bluetooth             |
| OS          | Windows                                |

The important parts for me are the RTX 5080, 128GB RAM, and 2TB fast storage. That combination gives me room for local AI tooling, Docker containers, VMs, WSL, IDEs, browsers, and project files without making the machine feel fragile.

## What I want to do with it

This PC is for:

- local LLM experiments
- local image generation experiments
- running many Docker containers
- running WSL for Linux development
- running VMs for isolated environments
- software development across web, Flutter, Go, backend, and AI tooling
- content creation for Ponkcoding

I do not expect this machine to replace cloud models. Cloud APIs are still useful. The point is to have a strong local option when I need privacy, faster iteration, or more control.

## Why 128GB RAM

The RAM is not just for one big workload. It is for many medium-sized workloads running together.

A normal session can include:

- IDEs and browsers
- Docker containers
- local databases
- WSL
- one or more VMs
- local AI tools
- Hermes Agent instances

That adds up quickly. 128GB gives me enough headroom to experiment without constantly stopping services or closing projects.

## VM and WSL plan

The plan is to run multiple environments, each with its own role.

| Environment  | Role                                                      |
| ------------ | --------------------------------------------------------- |
| Windows host | Main desktop, coordination, files, browser, creative work |
| WSL          | Linux development and CLI-heavy workflows                 |
| VM sandbox   | Full-access agent experiments inside an isolated machine  |
| Extra VM     | Clean environments for specific projects or risky tooling |

Each WSL or VM environment can have its own Hermes Agent. That makes the setup more modular. The host can stay clean, while each environment gets the tools and permissions it needs.

## Why agents inside VMs

Some agents are useful because they can take real action: edit files, run commands, install packages, start services, and inspect logs.

That is powerful, but it can also be risky.

So for experiments that need full access, I want to run the agent inside a VM. Inside the VM, the agent can have broad permissions. If something goes wrong, the damage is limited to that VM. The Windows host stays safe.

That is the main reason I want this setup:

1. Keep the old server stable and always-on.
2. Use the PC for heavy local work.
3. Use WSL for fast Linux development.
4. Use VMs for isolated full-access agents.

## The bigger picture

I want a setup where each machine has a clear job.

| Machine           | Job                                                            |
| ----------------- | -------------------------------------------------------------- |
| Old laptop server | Always-on automation, bots, cron, dashboards, Telegram gateway |
| New PC            | Development, local AI, Docker, WSL, VMs, isolated agent runs   |

The server should be boring and reliable. The PC can be flexible, experimental, and powerful.

That is the plan: a Windows workstation for daily development, local AI experiments, and safer multi-agent workflows.
