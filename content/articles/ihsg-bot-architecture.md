---
title: 'Building IHSG Bot: Architecture of My Trading Signal + Social Sentiment Pipeline'
slug: 'ihsg-bot-architecture'
description: 'A personal technical journal on how I built ihsg-bot: a Go TA/FA signal engine as the core, plus a Python Telegram sentiment layer (BSJP) and accuracy tracking that deliver daily stock picks to my Telegram.'
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

Every day after the market closes, a machine I built scans the whole IDX for stocks with good chart setups and healthy fundamentals, asks an LLM to pick the best ones, then pushes those signals to my Telegram. On top of that core engine, I later added a second lens: a pipeline that reads what people are shouting in dozens of Indonesian stock Telegram groups, scores the sentiment, and blends it with price data into a separate intraday signal (BSJP — Buy at Close, Sell at Open).

This entry breaks down the architecture of **ihsg-bot** — a monorepo I run on my home-lab box `ponkai`. The **signal engine is the main feature**; the social/BSJP layer is a complementary add-on. This isn't a tutorial; it's a personal reference of what the components are, how they talk, and the trade-offs I made.

---

## Big Picture: Three Worlds

I split ihsg-bot into three service groups in different languages, all connected through SQLite databases:

| World             | Language   | Role                                            |
| ----------------- | ---------- | ----------------------------------------------- |
| **Warehouse**     | Go         | Stock price fetcher (Yahoo Finance)             |
| **Signals**       | Go         | TA/FA screening + AI buy signals (core engine)  |
| **Social / BSJP** | Python     | Sentiment pipeline + signal + Telegram dispatch |
| **Reader**        | Go + React | Web dashboard to view signals + accuracy        |

Everything is orchestrated by **systemd timers** on ponkai, with a **Hermes cron** helping out for the daily digest.

![ihsg-bot architecture — high-level data flow](/images/articles/ihsg-bot/architecture.png)

---

## 1. Warehouse — The Data Source

`warehouse/` is a Go binary (`idx-warehouse`) I wrote to be the single source of truth for market data. It pulls from **two providers**, not one:

- **Yahoo Finance** — daily OHLCV prices for ~300 IDX stocks (needs the `.JK` suffix, e.g. `BBCA.JK`). The daily fetch timer runs **Mon–Fri 19:30 WIB**.
- **IDX XBRL** — verified fundamental filings (ROE, DER, revenue, etc.) scraped from the official IDX XBRL endpoint. I fetch these per-ticker with `idx-warehouse fundamentals fetch <TICKER> --year <Y> --period tw1|tw2|tw3|audit`, and they land as immutable XBRL facts in `warehouse.db`.

Both feed `warehouse.db` (~37k price records; fundamentals stored as versioned XBRL facts). The Signals engine reads the fundamentals for its FA filter; the price data backs both engines.

**Things I learned the hard way:**

- The Yahoo adapter had a fun bug: the `period2` parameter was computed from midnight of the target day, so the last day of any range was always truncated. I fixed it by extending to `23:59:59` (PR #16).

```bash
# Manual price fetch for one stock
/usr/local/bin/idx-warehouse fetch BBCA.JK --save

# Manual fundamental fetch (IDX XBRL)
/usr/local/bin/idx-warehouse fundamentals fetch BBCA --year 2025 --period tw3
```

Warehouse knows **nothing** about signals or sentiment. It's just my data provider.

---

## 2. Trading Signals — The Core Engine

This is the main feature of ihsg-bot: a Go signal generator under `signals/` that screens the entire market for stocks with strong technical and fundamental setups, then asks an LLM to decide which to buy. Where the BSJP layer (below) is _sentiment-driven_ (buy what people are shouting about), this engine is _fundamentals-and-technicals-driven_.

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

---

## 3. Social Pipeline — The BSJP Sentiment Layer

On top of the core signal engine, I built a Python pipeline under `social/` that captures market mood from Telegram. It runs as `idx-bsjp.service` every **Mon–Fri 15:00 WIB** (right after the 15:57 market close). Think of it as a second opinion: instead of charts and balance sheets, it listens to the crowd.

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

## 4. Accuracy Tracking — Learning From the Past

Both engines need to be checked against reality, but they track differently.

**Signals (core engine):** the generator keeps a feedback loop — `GetRecentClosedSignals(10)` feeds past outcomes back into the LLM prompt at Stage 1, so the model sees what worked before. Closed signals carry their realized result.

**BSJP (sentiment layer):** the `idx-bsjp-eval.service` timer runs **Mon–Fri 09:30 WIB** (next morning after the signal). Logic:

- `entry = close[signal_date]` (market close price when I made the signal)
- `exit = open[signal_date + 1]` (market open price this morning)
- `realized_gap_pct = (exit - entry) / entry * 100`
- `win = realized_gap_pct > 0`

Results go into `bsjp_outcomes`. `python -m track_accuracy --summary` gives me the win rate + avg gap over the last 30 days.

Honestly: both are prototypes, not yet backtested. But the tracking exists, so one day I can evaluate them seriously.

---

## 5. Market Digest — Context for Tomorrow

Beyond the signals (which are stock _picks_), I added a daily **market intelligence summary**.

`market_digest.py` reads today's mentions + BSJP signals, then asks the LLM: "what's interesting? any corporate action? acquisition? geopolitical? sentiment anomaly?" The result is a Markdown summary sent to my Telegram **Mon–Fri 18:00 WIB** (after market close + signal generation).

Goal: so I'm better prepared for tomorrow's open.

---

## 6. Reader — The Web Dashboard

`reader/` is a Go binary (`ihsg-reader`) I built that embeds a React SPA. Runs continuously on port `9090`.

Features in the dashboard:

- Menu **/signals** — the core engine's picks (entry/target/SL, TA/FA snapshot)
- Menu **/bsjp** — per-day sentiment signal table (ticker, score, hype, mentions, narrative)
- **Accuracy** cards — win rate, avg gap, total evaluated

The backend reads both `signals.db` and `social.db` directly (the Go registry opens every DB in the `[databases.*]` config — adding a DB source = adding a config block, no Go code change needed).

---

## Architecture Data Flow

![ihsg-bot data flow — Telegram to signal to Telegram](/images/articles/ihsg-bot/architecture-flow.png)

---

## LLM: OpenRouter, Not agy

I originally used the `agy` CLI for all my LLM calls. But the subscription expired, so I migrated to **OpenRouter** (`tencent/hy3:free`):

- `social/` Python: `requests.post` directly to OpenRouter
- `signals/` Go: used to be `exec.Command("agy")`, now `internal/agent/openrouter.go` (HTTP client)

One model, one API key env (`OPENROUTER_API_KEY`), consistent across all my modules.

---

## LLM: OpenRouter, Not agy

ihsg-bot started as a signal engine — a Go screener that asks an LLM to pick the best setups from the whole market. The BSJP social layer came later as a second lens: instead of charts, it listens to the crowd. Both are honest prototypes I built: gather data, measure what matters, blend with price, send to my Telegram, then check next morning if it was right.

What I find interesting isn't the accuracy (still prototypes), but **the architecture** — how three different worlds (Go, Python, React) can unite through SQLite + systemd without microservice overkill.

If you want to see the code: [github.com/rifaniponk/ihsg-bot](https://github.com/rifaniponk/ihsg-bot).
