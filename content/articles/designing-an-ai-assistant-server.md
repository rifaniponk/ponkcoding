---
title: 'Designing an AI assistant server that stays out of the way'
slug: 'designing-an-ai-assistant-server'
description: 'Small, boring architecture beats clever agents. Notes from six months of daily use.'
date: '2026-06-26'
category: 'AI Engineering'
tags:
  - ai
  - architecture
  - automation
status: 'published'
author: 'Rifan Fauzi'
---

I built a small server that sits between me and the models I use every day. The goal was never to be clever. The goal was to disappear — to make the assistant feel like part of the tools I already trust.

## One endpoint, many models

The core is a single endpoint that routes a request to whichever model fits the job. Cheap models handle formatting and classification; expensive ones are reserved for reasoning. The caller never has to know which is which.

Keeping the routing logic boring paid off. When a provider changed an API, I patched one adapter and everything downstream kept working.

## State lives in SQLite, not in prompts

Conversation history, tool results, and cached embeddings all live in a local SQLite file. Nothing about my daily workflow needs a hosted database, and the durability of a single file I can back up is worth more than any dashboard.

## What six months taught me

The features I thought I needed — agents planning multi-step tasks — I barely use. The features I lean on daily are the dull ones: reliable retries, a clean log, and a fast path for the same three prompts I run every morning.
