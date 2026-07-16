---
title: 'Building IHSG Bot: Architecture of My Social Sentiment + BSJP Signal Pipeline'
slug: 'ihsg-bot-architecture'
description: 'A personal technical journal on how I built ihsg-bot: a Telegram chatter pipeline, OpenRouter LLM scoring, Yahoo live data, and accuracy tracking that turn into daily stock signals delivered to my Telegram.'
date: '2026-07-16'
updated: '2026-07-16'
category: 'Trading Bot'
tags:
  - ihsg
  - trading-bot
  - python
  - go
  - openrouter
  - telegram
  - bsjp
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/ihsg-bot/cover.png'
featured: true
---

Every day after the market closes, a stream of conversations from dozens of Indonesian stock Telegram groups flows into a machine I built. That machine figures out which tickers people are actually talking about, measures how strong the sentiment is, then blends it with _live_ price data from Yahoo Finance. The result: a list of candidate stocks for the **BSJP** strategy (Buy at Close, Sell at Open) pushed straight to my Telegram.

In this entry I'm breaking down the architecture of **ihsg-bot** — a monorepo I run on my home-lab box `ponkai`. This isn't a tutorial; it's a personal reference of what the components are, how they talk, and the trade-offs I made along the way.

---

## Big Picture: Three Worlds

I split ihsg-bot into three service groups in different languages, all connected through SQLite databases:

| World             | Language   | Role                                            |
| ----------------- | ---------- | ----------------------------------------------- |
| **Warehouse**     | Go         | Stock price fetcher (Yahoo Finance)             |
| **Social / BSJP** | Python     | Sentiment pipeline + signal + Telegram dispatch |
| **Signals**       | Go         | TA/FA screening + AI buy signals (legacy)       |
| **Reader**        | Go + React | Web dashboard to view signals + accuracy        |

Everything is orchestrated by **systemd timers** on ponkai, with a **Hermes cron** helping out for the daily digest.

![ihsg-bot architecture — data flow from Telegram to signal](/images/articles/ihsg-bot/architecture.png)

> **Image note:** I generated the diagram above (and the cover) separately. Explanations of each component are below.

---

## 1. Warehouse — The Price Data Source

`warehouse/` is a Go binary (`idx-warehouse`) I wrote to pull daily OHLCV data from Yahoo Finance for ~300 IDX stocks (it needs the `.JK` suffix, e.g. `BBCA.JK`).

**Things I learned the hard way:**

- The timer runs **Mon–Fri 19:30 WIB** (after all of the day's data is final).
- The Yahoo adapter had a fun bug: the `period2` parameter was computed from midnight of the target day, so the last day of any range was always truncated. I fixed it by extending to `23:59:59` (PR #16).
- DB: `/var/lib/idxwarehouse/db/warehouse.db` (~37k records).

```bash
# Manual fetch for one stock
/usr/local/bin/idx-warehouse fetch BBCA.JK --save
```

Warehouse knows **nothing** about sentiment. It's just my price-fact provider.

---

## 2. Social Pipeline — The BSJP Brain

This is the heart of the bot, written in Python under `social/`. It runs as `idx-bsjp.service` every **Mon–Fri 15:00 WIB** (right after the 15:57 market close, though I compute the signal from data already present).

The pipeline has **4 stages**:

### Stage 1: Collect (`collectors.telegram`)

A Pyrogram userbot I set up reads all my joined Telegram groups, extracts ticker mentions (regex + casual match), then stores them in the `mentions` table in `social.db`.

**Gotcha I still need to fix:** the collector catches the Indonesian word "yang" (means _that/which_) as the ticker `YANG`. Not yet fixed — I need a stoplist. So I don't fully trust low-context tickers yet.

### Stage 2: Score (`analysis.sentiment`)

This is where the LLM earns its keep. OpenRouter (`tencent/hy3:free`) scores the sentiment of each mention in **batches of 8 per call** — not per-mention, to save time. 133 mentions need only ~14 calls instead of 12 minutes.

The model also detects **pump-dump** and **fear-mongering** patterns, not just a -1..+1 score. Results land in `hype_scores`.

### Stage 3: Signal (`bsjp_signal`)

I pull _live_ metrics from Yahoo (`.JK`), then _rank_ candidates:

```
bsjp_score = hype*0.5 + gap*0.25 + close*0.15 + liq*0.10
```

- `hype` — how loud it is on Telegram
- `gap` — average historical morning _gap up_ (the core of my BSJP strategy)
- `close` — strength of today's closing position (0..1)
- `liq` — liquidity (so I don't get stuck in thin stocks)

Then the LLM writes a short **narrative**: why it's worth it, what the risk is. Stored in `bsjp_signals` + the `narrative` column.

### Stage 4: Dispatch (`dispatch`)

Sends the signal to my Telegram chat `6417591526` via the Pyrogram userbot. Done — the signal lands before I finish my afternoon meal.

---

## 3. Accuracy Tracking — Learning from Yesterday

The bot doesn't just send signals, it also checks **whether yesterday's signal was right**.

The `idx-bsjp-eval.service` timer runs **Mon–Fri 09:30 WIB** (next morning after the signal). Logic:

- `entry = close[signal_date]` (market close price when I made the signal)
- `exit = open[signal_date + 1]` (market open price this morning)
- `realized_gap_pct = (exit - entry) / entry * 100`
- `win = realized_gap_pct > 0`

Results go into `bsjp_outcomes`. `python -m track_accuracy --summary` gives me the win rate + avg gap over the last 30 days.

Honestly: it's a prototype, not yet backtested. But the tracking exists, so one day I can evaluate it seriously.

---

## 4. Market Digest — Context for Tomorrow

Beyond the signal (which is a stock _pick_), I added a daily **market intelligence summary**.

`market_digest.py` reads today's mentions + BSJP signals, then asks the LLM: "what's interesting? any corporate action? acquisition? geopolitical? sentiment anomaly?" The result is a Markdown summary sent to my Telegram **Mon–Fri 18:00 WIB** (after market close + signal generation).

Goal: so I'm better prepared for tomorrow's open.

---

## 5. Reader — The Web Dashboard

`reader/` is a Go binary (`ihsg-reader`) I built that embeds a React SPA. Runs continuously on port `9090`.

BSJP features in the dashboard:

- Menu **/bsjp** — per-day signal table (ticker, score, hype, mentions, narrative)
- **Accuracy** cards — win rate, avg gap, total evaluated

The backend reads `social.db` directly (the Go registry opens every DB in the `[databases.*]` config — adding a DB source = adding a config block, no Go code change needed).

---

## 6. Trading Signals — The TA/FA Engine

Before I built the social pipeline, I wrote a second signal system in Go under `signals/`. Where BSJP is _sentiment-driven_ (buy what people are shouting about), this one is _fundamentals-and-technicals-driven_: it screens the whole market for stocks with good chart setups and healthy balance sheets, then asks the LLM to pick the best.

The generator (`cmd/signals`) runs a **two-stage pipeline**:

**Stage 1 — AI evaluation of every screened candidate.** `RunScreeningPipeline` pulls candidates from `warehouse.db` that pass both technical (TA score) and fundamental (ROE, DER) filters. For each one, the LLM returns `BUY`/`NO_BUY` + a confidence score. I keep a feedback loop: the 10 most recent closed signals are fed back into the prompt so the model sees what worked before.

**Stage 2 — rank and pick.** All `BUY` candidates are scored by a composite:

```
composite = confidence*0.6 + taNorm*0.25 + faStrength*0.15
```

- `confidence` — the LLM's conviction (already blends TA + FA + news)
- `taNorm` — technical score normalized 0..1
- `faStrength` — `(ROE/100) - (DER/20)`, clamped to -1..1

The top **3** become active signals with an `entry`, `target` (entry + 1.5×ATR if the model didn't give one), and `stop_loss` (entry − 1.0×ATR). Stored in `signals.db` (`trading_signals` table).

**Where it stands today:** the generator has no systemd timer — it's dormant. The Reader still serves `/api/v1/signals/*` from the historical `signals.db` (49KB of past signals), so the dashboard shows both systems side by side. If I ever re-activate it, I just set `OPENROUTER_API_KEY` in the unit and rebuild. I migrated its LLM call off `agy` too (`internal/agent/openrouter.go`), same model as everything else.

**BSJP vs Signals — the two lenses:**

|          | **BSJP** (Python)                 | **Signals** (Go)               |
| -------- | --------------------------------- | ------------------------------ |
| Driver   | Telegram sentiment (hype)         | Technical + fundamental screen |
| Horizon  | Intraday (buy close, sell open)   | Positional (entry/target/SL)   |
| Picks    | Top hype × gap candidates         | Top 3 by composite score       |
| LLM role | Score sentiment + write narrative | Decide BUY + set target/SL     |
| Status   | Live (15:00 WIB timer)            | Dormant (no timer)             |

I like having both: BSJP catches what the crowd is excited about today; Signals catches what the charts say is actually setup. They answer different questions.

---

## Architecture Data Flow

```
Telegram groups
    │ (Pyrogram userbot)
    ▼
[collectors.telegram] ──▶ mentions (social.db)
    │                          │
    │                     [analysis.sentiment] OpenRouter LLM
    │                          │
    │                          ▼
    │                     hype_scores (social.db)
    │                          │
Yahoo Finance ──▶ [warehouse] ─┤
    │                          │
    │                     [bsjp_signal] Yahoo live + LLM narrative
    │                          │
    │                          ▼
    │                     bsjp_signals (social.db)
    │                          │
    │                     [dispatch] ──▶ Telegram chat 6417591526
    │
[market_digest] ──▶ Telegram (18:00 WIB)
[idx-bsjp-eval] ──▶ bsjp_outcomes (next morning)
[reader] ──▶ web dashboard :9090
```

---

## LLM: OpenRouter, Not agy

I originally used the `agy` CLI for all my LLM calls. But the subscription expired, so I migrated to **OpenRouter** (`tencent/hy3:free`):

- `social/` Python: `requests.post` directly to OpenRouter
- `signals/` Go: used to be `exec.Command("agy")`, now `internal/agent/openrouter.go` (HTTP client)

One model, one API key env (`OPENROUTER_API_KEY`), consistent across all my modules.

---

## Deployment

All on systemd. Three commands to redeploy on ponkai:

```bash
sudo bash deploy/idx-deploy.sh          # warehouse + signals binary
sudo bash deploy/idx-social-install.sh  # BSJP + digest timer
sudo bash deploy/idx-reader-install.sh  # dashboard
```

The timers:

- `idx-warehouse.timer` — daily fetch (Tue–Sat 04:00 WIB)
- `idx-bsjp.timer` — pipeline (Mon–Fri 15:00 WIB)
- `idx-bsjp-eval.timer` — evaluation (Mon–Fri 09:30 WIB)
- `idx-market-digest.timer` — digest (Mon–Fri 18:00 WIB)

---

## Architecture Lessons

1. **Separate data sources from intelligence.** Warehouse (facts) and Social (sentiment) are separate DBs, separate languages. They meet only at the signal stage.
2. **Batch LLM calls.** Don't call the LLM per-item if you can batch. 14 calls vs 133 calls = 12 minutes difference.
3. **Track your own accuracy.** A signal without evaluation is just noise. Store the outcome, compute the win rate.
4. **Auto-migrate schema.** `db.py connect()` adds the `narrative` column + `bsjp_outcomes` table idempotently. No manual migration every time I add a column.
5. **Pick one trigger.** The market digest has two triggers (Hermes cron + systemd timer) — don't leave both on, or it double-sends.

---

## Closing

ihsg-bot isn't a backtested trading system. It's an honest prototype I built: gather market gossip, measure sentiment, blend with price, send to my Telegram, then check next morning if it was right.

What I find interesting isn't the accuracy (still a prototype), but **the architecture** — how three different worlds (Go, Python, React) can unite through SQLite + systemd without microservice overkill.

If you want to see the code: [github.com/rifaniponk/ihsg-bot](https://github.com/rifaniponk/ihsg-bot).
