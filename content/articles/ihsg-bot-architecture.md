---
title: 'Membangun IHSG Bot: Arsitektur Social Sentiment + BSJP Signal'
slug: 'ihsg-bot-architecture'
description: 'Cerita teknis di balik ihsg-bot: how a Telegram chatter pipeline, OpenRouter LLM scoring, Yahoo live data, dan accuracy tracking menyatu menjadi sinyal saham harian yang dikirim otomatis ke Telegram.'
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

Setiap hari setelah pasar tutup, ada ringkasan percakapan dari puluhan grup Telegram saham Indonesia yang mengalir ke sebuah mesin. Mesin itu menilai mana emiten yang lagi ramai dibicarakan, mengukur kekuatan sentimen, lalu memadukannya dengan data harga _live_ dari Yahoo Finance. Hasilnya: daftar kandidat saham untuk strategi **BSJP** (Beli Sore, Jual Pagi) yang langsung dikirim ke Telegram.

Artikel ini membongkar arsitektur **ihsg-bot** — monorepo yang berjalan di mesin `ponkai` (homelab pribadi). Bukan tutorial langkah-demi-langkah, tapi _reference_ arsitektur: komponen apa, bagaimana mereka berbicara, dan trade-off yang diambil.

---

## Big Picture: Tiga Dunia

ihsg-bot terdiri dari tiga kelompok layanan yang berbeda bahasa tapi saling terhubung melalui database SQLite:

| Dunia             | Bahasa     | Peran                                           |
| ----------------- | ---------- | ----------------------------------------------- |
| **Warehouse**     | Go         | Pengambil data harga saham (Yahoo Finance)      |
| **Social / BSJP** | Python     | Pipeline sentiment + sinyal + dispatch Telegram |
| **Reader**        | Go + React | Dashboard web untuk lihat sinyal + akurasi      |

Semuanya di-orchestrate oleh **systemd timer** di ponkai, dan dibantu **Hermes cron** untuk ringkasan harian.

![Arsitektur ihsg-bot — alur data dari Telegram ke sinyal](/images/articles/ihsg-bot/architecture.png)

> **Catatan gambar:** Diagram di atas (dan cover) saya generate terpisah. Penjelasan tiap komponen ada di bawah.

---

## 1. Warehouse — Sumber Data Harga

`warehouse/` adalah binary Go (`idx-warehouse`) yang menarik data OHLCV harian dari Yahoo Finance untuk ~300 saham IDX (butuh suffix `.JK`, misal `BBCA.JK`).

**Fakta teknis yang penting:**

- Timer jalan **Senin–Jumat 19:30 WIB** (setelah semua data hari itu final).
- Adapter Yahoo punya _bug_ menarik: parameter `period2` dihitung dari tengah malam hari target, sehingga hari terakhir dari rentang selalu kepotong. Fix-nya: extend ke `23:59:59` (PR #16).
- DB: `/var/lib/idxwarehouse/db/warehouse.db` (~37k records).

```bash
# Fetch manual satu saham
/usr/local/bin/idx-warehouse fetch BBCA.JK --save
```

Warehouse **tidak** tahu menahu soal sentiment. Dia cuma penyedia fakta harga.

---

## 2. Social Pipeline — Otak BSJP

Ini jantung bot, ditulis Python di folder `social/`. Berjalan sebagai `idx-bsjp.service` tiap **Senin–Jumat 15:00 WIB** (tepat setelah penutupan pasar 15:57, tapi sinyal dihitung dari data yang sudah ada).

Pipeline punya **4 tahap**:

### Tahap 1: Collect (`collectors.telegram`)

Userbot Pyrogram membaca semua grup Telegram yang di-join, mengekstrak mention ticker (regex + kasual match), lalu menyimpan ke tabel `mentions` di `social.db`.

**Gotcha:** collector menangkap kata "yang" (bahasa Indo = _that/which_) sebagai ticker `YANG`. Belum di-fix — butuh stoplist. Jadi jangan percaya 100% pada ticker dengan konteks rendah.

### Tahap 2: Score (`analysis.sentiment`)

Di sinilah LLM masuk. OpenRouter (`tencent/hy3:free`) mem-score sentiment tiap mention dalam **batch 8 mention per call** (bukan per-mention, supaya hemat waktu — 133 mention cuma butuh ~14 call, bukan 12 menit).

Model juga mendeteksi pola **pump-dump** dan **fear-mongering**, bukan cuma skor -1..+1. Hasilnya masuk ke `hype_scores`.

### Tahap 3: Signal (`bsjp_signal`)

Ambil metrik _live_ dari Yahoo (`.JK`), lalu _rank_ kandidat:

```
bsjp_score = hype*0.5 + gap*0.25 + close*0.15 + liq*0.10
```

- `hype` — seberapa ramai di Telegram
- `gap` — rata-rata _gap up_ pagi historis (inti strategi BSJP)
- `close` — kekuatan posisi penutupan hari ini (0..1)
- `liq` — likuiditas (biar gak kejebak saham tipis)

Lalu LLM (lagi) menulis **narrative** singkat: kenapa layak, apa risk-nya. Disimpan di `bsjp_signals` + kolom `narrative`.

### Tahap 4: Dispatch (`dispatch`)

Kirim sinyal ke chat Telegram `6417591526` via Pyrogram userbot. Selesai — sinyal sampai sebelum kamu selesai makan sore.

---

## 3. Accuracy Tracking — Belajar dari Kemarin

Bot tidak cuma kirim sinyal, tapi juga mengecek **apakah sinyal kemarin benar**.

Timer `idx-bsjp-eval.service` jalan **Senin–Jumat 09:30 WIB** (besok pagi setelah sinyal). Logika:

- `entry = close[signal_date]` (harga pasar tutup saat sinyal dibuat)
- `exit = open[signal_date + 1]` (harga pasar buka pagi ini)
- `realized_gap_pct = (exit - entry) / entry * 100`
- `win = realized_gap_pct > 0`

Hasil masuk ke `bsjp_outcomes`. Perintah `python -m track_accuracy --summary` kasih win rate + avg gap 30 hari terakhir.

Ini jujur: prototype, belum di-backtest. Tapi tracking ada, sehingga suatu hari bisa di-evaluasi serius.

---

## 4. Market Digest — Konteks untuk Besok

Selain sinyal (yang berupa _pick_ saham), ada **ringkasan intelijen pasar** harian.

`market_digest.py` membaca mentions + BSJP signals hari ini, lalu tanya LLM: "apa yang menarik? ada corporate action? akuisisi? geopolitik? anomali sentiment?" Hasilnya Markdown summary yang dikirim ke Telegram **Senin–Jumat 18:00 WIB** (setelah pasar tutup + sinyal jadi).

Tujuannya: biar kamu lebih siap menyambut pembukaan besok.

---

## 5. Reader — Dashboard Web

`reader/` adalah binary Go (`ihsg-reader`) yang nge-embed React SPA. Jalan terus di port `9090`.

Fitur BSJP di dashboard:

- Menu **/bsjp** — tabel sinyal per hari (ticker, score, hype, mentions, narrative)
- Kartu **akurasi** — win rate, avg gap, total evaluasi

Backend baca `social.db` langsung (Go registry buka semua DB di config `[databases.*]` — nambah sumber DB = nambah blok config, gak perlu ubah Go code).

---

## Arsitektur Data Flow

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

## LLM: OpenRouter, Bukan agy

Awalnya pakai `agy` CLI untuk semua pemanggilan LLM. Tapi subscription habis. Migrasi ke **OpenRouter** (`tencent/hy3:free`):

- `social/` Python: `requests.post` langsung ke OpenRouter
- `signals/` Go: dulu `exec.Command("agy")`, sekarang `internal/agent/openrouter.go` (HTTP client)

Satu model, satu API key env (`OPENROUTER_API_KEY`), konsisten di semua modul.

---

## Deployment

Semua di systemd. Tiga command buat deploy ulang di ponkai:

```bash
sudo bash deploy/idx-deploy.sh          # warehouse + signals binary
sudo bash deploy/idx-social-install.sh  # BSJP + digest timer
sudo bash deploy/idx-reader-install.sh  # dashboard
```

Timernya:

- `idx-warehouse.timer` — fetch harian (Selasa–Sabtu 04:00 WIB)
- `idx-bsjp.timer` — pipeline (Senin–Jumat 15:00 WIB)
- `idx-bsjp-eval.timer` — evaluasi (Senin–Jumat 09:30 WIB)
- `idx-market-digest.timer` — ringkasan (Senin–Jumat 18:00 WIB)

---

## Pelajaran Arsitektur

1. **Pisahkan sumber data dari intelijen.** Warehouse (fakta) dan Social (sentiment) terpisah DB, terpisah bahasa. Mereka bertemu cuma di tahap signal.
2. **Batch LLM calls.** Jangan panggil LLM per-item kalau bisa di-batch. 14 call vs 133 call = beda 12 menit.
3. **Track your own accuracy.** Sinyal tanpa evaluasi cuma noise. Simpan outcome, hitung win rate.
4. **Auto-migrate schema.** `db.py connect()` menambah kolom `narrative` + tabel `bsjp_outcomes` secara idempoten. Gak perlu migrasi manual tiap kali nambah kolom.
5. **Pilih satu trigger.** Market digest punya dua trigger (Hermes cron + systemd timer) — jangan biarkan dua-duanya nyala, nanti dobel kirim.

---

## Penutup

ihsg-bot bukan sistem trading yang sudah di-backtest. Dia prototype yang jujur: kumpulin gossip pasar, ukur sentiment, padukan dengan harga, kirim ke Telegram, lalu cek besok pagi apa benar.

Yang menarik bukan akurasinya (masih prototype), tapi **arsitekturnya** — bagaimana tiga dunia (Go, Python, React) yang berbeda bisa menyatu lewat SQLite + systemd tanpa microservice overkill.

Kalau mau lihat kodenya: [github.com/rifaniponk/ihsg-bot](https://github.com/rifaniponk/ihsg-bot).
