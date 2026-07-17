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

At the base is a Go service that acts as my single source of truth for market data. It pulls from **two providers**:

- **Yahoo Finance** — daily OHLCV prices for the ~500 IDX stocks I track. A timer fetches this every morning after the market closes.
- **IDX XBRL** — the official IDX endpoint for verified fundamental filings (ROE, DER, revenue, and so on). These land as immutable, versioned facts in the database.

Both feed one warehouse database. The Signals engine reads the fundamentals for its FA filter; the price data backs both engines. The warehouse knows **nothing** about signals or sentiment — it's purely my data provider.

---

## 2. Trading Signals — The Core Engine

This is the main feature of ihsg-bot: a Go signal generator that screens the entire ~500-stock watchlist for names with strong technical and fundamental setups, then asks an LLM to make the final buy call. This engine is _fundamentals-and-technicals-driven_; the BSJP layer below is the opposite — _sentiment-driven_.

The generator runs a **two-stage pipeline**:

**Stage 0 — screen (TA + FA).** For every stock with a valid end-of-day record, the engine computes a technical score from four indicators:

- **RSI(14)** — flags oversold recovery (dipped below 35, now climbing back under 55)
- **EMA(20)** and **SMA(50)** — a golden-cross trigger when the short EMA crosses above the long SMA, plus a simpler "price above EMA20" state
- **ATR(14)** — used later to size the stop-loss
- **Volume vs 20-day average** — a volume-expansion trigger when the day's volume exceeds 1.5× the average

Each triggered pattern adds to a bullish score (golden cross +40, RSI recovery +35, volume expansion +25, EMA cross +30). Stocks with zero triggers are discarded.

In parallel, the engine pulls the latest **XBRL fundamental filing** and runs three hard filters:

- **Net income > 0** (must be profitable)
- **Debt-to-Equity < 3.0** (skipped for banks/financials, where leverage is normal)
- **P/E < 45** (no extreme valuation)

Only stocks that pass both the technical scan and the fundamental filter survive to the AI stage.

**Stage 1 — AI evaluation of every surviving candidate.** Each candidate is handed to the LLM as a structured brief: the technical triggers, the RSI/EMA/SMA/ATR numbers, the fundamental snapshot (net income, assets, liabilities, ROE, DER, P/E), and a web-search step where the model checks recent news sentiment (dividends, profit warnings, management changes) under strict guardrails — it may use the web for _qualitative_ context only, never to invent figures. The model returns `BUY` / `NO_BUY`, a confidence score (0–1), and a suggested target + stop-loss. I keep a feedback loop: the 10 most recent closed signals are fed back into the prompt so the model sees what actually worked before.

**Stage 2 — rank and pick.** A `BUY` is accepted only if confidence is **≥ 0.70**. All accepted candidates are ranked by a composite:

```
composite = confidence * 0.6 + taNorm * 0.25 + faStrength * 0.15
```

where `taNorm` is the technical score normalized 0–1 and `faStrength` blends ROE (good) against DER (bad). The **top 3** become active signals; target defaults to entry + 1.5×ATR and stop-loss to entry − 1.0×ATR when the model doesn't supply them. They're stored in the signals database.

**Where it stands today:** the generator is currently dormant — it has no scheduled timer. The dashboard still serves the historical signals, so both systems show up side by side. I migrated its LLM call off the old CLI onto OpenRouter, same model as everything else, so re-activating it is just a config change.

---

## 3. Social Pipeline — The BSJP Sentiment Layer

On top of the core signal engine, I built a Python pipeline under `social/` that captures market mood from Telegram. It runs as `idx-bsjp.service` every **Mon–Fri 15:00 WIB** (right after the 15:57 market close). Think of it as a second opinion: instead of charts and balance sheets, it listens to the crowd.

The pipeline has **4 stages**:

### Stage 1: Collect (`collectors.telegram`)

A Pyrogram userbot I set up reads all my joined Telegram groups, extracts ticker mentions (regex + casual match), then stores them in the `mentions` table in `social.db`.

**Gotcha I still need to fix:** the collector catches the Indonesian word "yang" (means _that/which_) as the ticker `YANG`. Not yet fixed — I need a stoplist. So I don't fully trust low-context tickers yet.

### Stage 2: Score

This is where the LLM earns its keep. It scores the sentiment of each mention in **batches** — not one call per mention, to save time. A day's 130+ mentions collapse into ~14 calls.

The model also detects **pump-dump** and **fear-mongering** patterns, not just a -1..+1 score. Results land in the hype table.

### Stage 3: Signal

I pull _live_ metrics from Yahoo, then _rank_ candidates by a blend of how loud they are on Telegram, their historical morning gap-up, today's close strength, and liquidity (so I don't get stuck in thin stocks). Then the LLM writes a short **narrative**: why it's worth it, what the risk is.

### Stage 4: Dispatch

Sends the signal to my Telegram via the userbot. Done — the signal lands before I finish my afternoon meal.

---

## 4. Accuracy Tracking — Learning From the Past

Both engines need to be checked against reality, but they track differently.

**Signals (core engine):** the generator keeps a feedback loop — `GetRecentClosedSignals(10)` feeds past outcomes back into the LLM prompt at Stage 1, so the model sees what worked before. Closed signals carry their realized result.

**BSJP (sentiment layer):** the `idx-bsjp-eval.service` timer runs **Mon–Fri 09:30 WIB** (next morning after the signal). Logic:

- `entry = close[signal_date]` (market close price when I made the signal)
- `exit = open[signal_date + 1]` (market open price this morning)
- `realized_gap_pct = (exit - entry) / entry * 100`
- `win = realized_gap_pct > 0`

Results go into the outcomes table. A summary command gives me the win rate + average gap over the last 30 days.

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

## Closing

ihsg-bot started as a signal engine — a Go screener that asks an LLM to pick the best setups from the whole market. The BSJP social layer came later as a second lens: instead of charts, it listens to the crowd. Both are honest prototypes I built: gather data, measure what matters, blend with price, send to my Telegram, then check next morning if it was right.

What I find interesting isn't the accuracy (still prototypes), but **the architecture** — how three different worlds (Go, Python, React) can unite through SQLite + systemd without microservice overkill.
