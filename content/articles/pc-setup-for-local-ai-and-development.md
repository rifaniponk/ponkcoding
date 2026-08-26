---
title: 'My PC setup for local AI and development'
slug: 'pc-setup-for-local-ai-and-development'
description: 'A practical note on the Windows workstation I built around an i7-14700, RTX 5080, and 128GB RAM, plus how I plan to use it for local AI, software engineering, and personal automation.'
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

For the last few months, most of my AI and automation work has lived on a small always-on server. It is practical, quiet, and good enough for orchestration. But it is not the right machine for heavy local AI experiments, GPU workloads, video-heavy workflows, or a Windows-first desktop setup.

So I built a new PC with a very different role: a high-memory Windows workstation that can handle development, local AI, content work, and experiments that are too heavy for my small server.

This is not a benchmark post. It is a note about the setup, the reasoning behind the parts, and the plan for how I want to use it.

## The actual build

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

The theme is simple: enough CPU for daily software work, enough RAM for many services and browsers at once, fast local storage, and an NVIDIA GPU for local AI experiments.

## Why this build exists

My old agent server is still useful, but it is intentionally boring. It runs background jobs, bots, dashboards, cron tasks, and Telegram-connected agents. That machine is good at staying online.

This PC has a different job. It is for interactive work:

- coding with full IDEs, browsers, terminals, and design tools open at the same time
- running local LLM experiments when I need privacy, speed, or iteration without API round trips
- running many Docker containers without turning the machine into a memory-pressure puzzle
- running VMs and WSL environments for isolated Linux work on top of Windows
- testing GPU-accelerated workflows that do not belong on the always-on server
- working on Flutter, web, Go, and backend projects in a comfortable Windows desktop environment
- keeping enough headroom so the machine does not feel fragile when many things are open

The old server remains the background operator. This PC becomes the workstation and the local lab.

## CPU: i7-14700 as the general-purpose engine

I did not build this only for gaming or only for AI. Most of my day-to-day work is still software engineering: IDEs, TypeScript builds, Go builds, Docker, browser sessions, local databases, Git operations, and many small tools running together.

The Intel Core i7-14700 gives me a strong general-purpose base for that. It is not the absolute top of the stack, but it is a very practical CPU for mixed workloads. The important part is consistency: fast enough for build loops, responsive enough under load, and capable enough when I run multiple dev services at the same time.

## GPU: RTX 5080 for local AI headroom

The GPU is the part that changes what I can experiment with locally.

The NVIDIA GeForce RTX 5080 with 16GB GDDR7 gives me a much better local AI playground than a CPU-only machine. I do not expect it to replace every cloud model or every hosted API. That is not the point. The point is to have a local path for experiments where iteration speed, privacy, and cost control matter.

The workflows I want to explore:

- local LLM inference for smaller models
- local image generation and editing experiments
- retrieval and embedding pipelines that can run without waiting on external services
- agent workflows where the PC does the heavy local task, while the server handles scheduling and delivery
- AI-assisted development with local context and local files

Cloud models are still useful. But having local compute means I can choose instead of depending on one path.

## RAM: 128GB because modern development is messy

The 128GB RAM is not about showing off. It is about removing friction.

A normal workday can easily include:

- one or two IDE windows
- several browser profiles
- local databases
- many Docker containers
- one or more VMs
- multiple WSL distros
- a Hermes Agent instance inside each VM or WSL environment
- Node, Go, Flutter, and Python processes
- AI tooling
- design references
- chat, documentation, and dashboards

On paper, many of those are small. In practice, they accumulate. 128GB means I can leave workspaces open, switch context, and run heavier local experiments without constantly thinking about memory pressure.

The important part is not only capacity. It is isolation. If one VM is running an agent with full access to its own environment, I want that VM to have enough memory to operate normally without borrowing stability from the host. The host stays calm. The experiment gets room to breathe.

The motherboard is DDR4, so I went with a large DDR4-3600 kit instead of chasing a newer platform just for the sake of it. For my use case, capacity matters more than peak memory benchmark numbers.

## Storage: one fast 2TB working drive

The MSI Spatium M480 Pro 2TB is the main working drive. I want the OS, projects, caches, package managers, local models, Docker data, and media files to have room before I need to think about cleanup.

2TB is a practical starting point. Local AI artifacts can get big quickly, especially model files, generated assets, datasets, and cache directories. I would rather start with space than constantly move things around.

## Why Windows

I still like Linux for servers. My always-on agent box stays Linux-first because it is better for long-running services, systemd, SSH, and simple remote operations.

But this PC is my workstation, and Windows makes sense here:

- better desktop app compatibility
- NVIDIA tooling is straightforward
- easier gaming and media workflows if I want them
- WSL can cover most Linux development needs
- my day-to-day work can stay in a familiar desktop environment

The plan is not Windows versus Linux. The plan is Windows on the desk, Linux on the server, and WSL as the bridge when needed.

## VM and WSL as agent sandboxes

The most interesting part of this setup is not that the PC can run local models. It is that the machine can host several isolated execution environments.

I want each serious environment to have its own Hermes Agent:

| Environment  | Agent role                                                         |
| ------------ | ------------------------------------------------------------------ |
| Windows host | Daily desktop coordination, files, browser, creative work          |
| WSL          | Linux development, CLI-heavy workflows, local repo automation      |
| VM sandbox   | Full-access agent experiments with a disposable boundary           |
| Extra VM     | Specialized projects that need clean dependencies or risky tooling |

The VM part matters for safety. Some agents are useful precisely because they can take action: edit files, run commands, install packages, inspect logs, start services, and recover from errors. That is powerful, but I do not want every experiment to have full access to the host machine.

So the plan is to run more dangerous or exploratory agents inside VMs. Inside the VM, the agent can have broad access. It can break dependencies, fill a temporary disk, crash a service, or leave a messy workspace. If something goes wrong, the blast radius is the VM. The Windows host stays safe.

That is the model I want:

1. Use the host for normal work and coordination.
2. Use WSL for fast Linux-native development.
3. Use VMs for isolated agent runs with full access inside the sandbox.
4. Keep the old server as the always-on scheduler and delivery layer.

This is also why the build has so much RAM. One Hermes Agent is light. Several agents, Docker containers, local services, WSL, a VM, and a local model runtime running together are not light anymore.

## How it fits with my existing server

The most important architectural decision is that I do not want this PC to replace my small server.

The split looks like this:

| Machine           | Role                                                                      |
| ----------------- | ------------------------------------------------------------------------- |
| Old laptop server | Always-on automation, bots, cron, dashboards, Telegram gateway            |
| New PC            | Interactive development, local AI, GPU workloads, content and experiments |

That separation matters. The server should remain boring and always available. The PC can reboot, sleep, run experiments, change drivers, and break occasionally without taking down my automation.

In the long run, I want them to cooperate:

1. The server receives tasks through Telegram or scheduled jobs.
2. If a task needs heavy local compute, it can delegate to the PC when the PC is awake.
3. The PC handles the expensive part, such as local inference, media processing, or large indexing.
4. The server stores the result, sends the update, or continues the workflow.

That is the direction I care about: not just a powerful PC, but a useful node in a personal automation system.

## What I plan to build on it

The first plan is simple: make the machine comfortable for daily development.

After that, I want to use it for a few concrete workflows.

### 1. Local AI development environment

I want a reliable local stack for testing smaller models, embeddings, and local-first agent workflows. The goal is not to chase every new model. The goal is to have a stable environment where I can prototype without thinking about token cost or API latency.

This includes local LLM inference, embedding services, vector databases, small API servers, notebooks, and background workers. Some of those will run directly on Windows. Some will run in WSL. Some will run in Docker. If the experiment needs broad system access, it belongs in a VM.

### 2. Multi-agent development loop

For coding, I want the PC to become the place where large repos, local tools, and AI assistance meet. The server can still handle background automation, but the workstation should be where deep code exploration happens.

The long-term idea is to have Hermes Agent available in several places: one on the host for coordination, one in WSL for Linux-native development, and one or more inside VMs for isolated full-access runs. That makes the agent setup more modular. Each environment gets the tools and permissions it needs, without making the Windows host responsible for every risky operation.

### 3. Content and writing pipeline

Ponkcoding is where I document what I build. A stronger PC makes the writing workflow easier: screenshots, diagrams, local previews, media processing, and AI-assisted drafts can happen on the same machine.

### 4. Portfolio and finance tooling

My IHSG tooling already runs on the server side. The PC gives me more room for analysis: notebooks, dashboards, local experiments, and maybe heavier backtests that do not need to run all day.

### 5. A more practical homelab split

I want the home setup to be boring in the right places and powerful in the right places. The server should be stable. The PC should be flexible. That split feels more useful than trying to make one machine do everything.

## What I am not trying to do

I am not trying to build a data center at home. I am also not trying to make every workflow local just because local feels cool.

The practical rule is:

- use local compute when it gives privacy, speed, control, or lower iteration cost
- use cloud models when they are clearly better, easier, or more reliable
- keep the server stable
- let the workstation be the place for experiments

That balance is more useful than being ideological about local versus cloud.

## Closing note

This build is not only about specs. It is about changing the shape of my workflow.

The old laptop server gave me a reliable automation layer. This PC gives me a serious interactive layer. Together, they make a setup where I can build, test, automate, and document ideas without waiting for a perfect external platform.

That is the plan: a full-time software engineer's workstation by day, a personal AI lab and project machine by night.
