---
title: 'Can a machine check your recitation? Researching voice verification for Ayatura'
slug: 'verifying-quran-recitation'
description: 'The research behind the next phase of Ayatura: using speech recognition to verify spoken Quran recitation in the Next Verse practice mode, and why the honest MVP is narrower than the marketing around it.'
date: '2026-07-07'
category: 'Indie Dev'
tags:
  - indie-dev
  - flutter
  - machine-learning
  - quran
status: 'published'
author: 'Rifan Fauzi'
---

Ayatura's Next Verse practice mode currently records self-assessment. The app shows a prompt, the user recites the continuation, reveals the answer, and marks whether they got it right. That was a deliberate limit: the app records what the user reports, not a claim that a speech model can judge Quran recitation.

The obvious next question is whether that limit can move. Can the app listen to a recitation and decide, on its own, whether the user continued with the correct ayah? In Indonesian this practice is called _sambung ayat_ — "connect the verse." Before writing any feature code, I ran a research pass to find out what is actually feasible in 2026 and where the honest boundaries are.

This article is about that research: what the problem really is, what the literature and open-source ecosystem support today, and the architecture I would ship first. It is not an announcement that the feature is live. It is the reasoning that decides whether it should be.

## Why this is not ordinary speech-to-text

The instinct is to reach for a general Arabic speech-to-text API, transcribe the audio, and compare strings. That underestimates and overestimates the problem at the same time.

Three structural facts change the engineering trade-offs.

First, **the target text is closed.** The Quran in the Hafs reading is a finite, canonical corpus of 6,236 ayahs. Most Arabic speech recognition is tuned for open-vocabulary news and dialect speech. Here I know exactly which words can come next, so I can constrain the problem far more aggressively than a general transcriber allows.

Second, **the acoustic style is unusual.** Recitation has long vowels (madd), distinctive prosody, ghunna, qalqala, and pause rules that do not appear in modern standard Arabic news audio. Models trained on conversational or broadcast Arabic mis-transcribe even fluent recitation. This is precisely why Quran-finetuned models beat stock ones on this task.

Third, **the output I need is a decision, not a transcript.** The feature has to answer "did the user recite the expected continuation correctly?" — a correct-or-not flag with optional word-level hints. That is a much easier problem than producing perfectly diacritized Arabic from scratch.

## Being precise about capability levels

It is easy to promise more than a model can deliver here, so I separated the space into four levels and forced myself to be honest about each.

| Level | Capability                                           | Feasible in 2026? |
| ----- | ---------------------------------------------------- | ----------------- |
| L1    | Verse match: did the user recite the expected ayah?  | High              |
| L2    | Word-level error highlighting (missing / extra word) | Medium-high       |
| L3    | Pronunciation error detection (wrong makhraj, etc.)  | Experimental      |
| L4    | Tajweed grading (madd, ghunna, qalqala, ikhfa…)      | Research-only     |

Open Quran-finetuned models already reach under 10% word error rate on clean Hafs audio, which makes L1 practical. Word-level alignment (L2) is demonstrated in open repositories. But L3 and L4 are not solved problems on real users. The strongest published tajweed numbers — accuracies in the 95–99% range — come from a three-rule classification task on a small corpus, not from open-vocabulary grading across accents and beginners.

That distinction is the whole point of the research. Ayatura should target L1 with optional L2 hints and refuse to make L3 or L4 claims until the data and models exist. The product copy has to match: "recitation recognized / not yet recognized," never "your tajweed is wrong."

## What already exists

A useful surprise: I do not have to build the core model. Quran recitation recognition is a narrow, well-studied subdomain, and much of the ecosystem is permissively licensed.

- A Quran-finetuned Whisper model, `tarteel-ai/whisper-base-ar-quran` (Apache 2.0), reports around 5.75% word error rate on its evaluation set. It is roughly 74M parameters and runs acceptably on CPU.
- An open-source pipeline, the Real-Time Quran Recitation Tracker (MIT), already combines Whisper-class recognition with Arabic text normalization, Levenshtein distance, and sequence alignment to do word-level tracking — essentially a blueprint for this feature.
- The Tarteel EveryAyah dataset (~932 hours, 36 reciters, full Quran, MIT) and Tanzil's Quran text (CC BY 3.0) make a Hafs-only version feasible without collecting any data myself.
- A commercial product, Tarteel, already ships this at scale for 15M+ users, which is both a proof of feasibility and a signal about positioning.

The lesson that repeats across Ayatura's build: if reliable, well-licensed reference material exists, use it rather than reinventing it.

## The approaches I compared

I weighed five implementation options against Quran-specific accuracy, build simplicity, cost, privacy, offline support, and extensibility.

1. **General cloud speech-to-text plus text comparison.** Fast to ship, but not Quran-tuned, per-minute costs add up, and audio leaves the device. Fine scaffolding for a proof of concept, inferior for a real version.
2. **On-device general recognition.** Full privacy and offline, but a generic Arabic model is the weakest on recitation, and larger models are slow on mid-range Android. Premature now, strong candidate later with a Quran-finetuned model exported to ONNX.
3. **Quran-finetuned recognition on a small backend.** Highest Quran-specific accuracy that ships in weeks, open-source, cheap to host, and word-level outputs keep the door open to L2. Audio leaves the device for processing, so privacy has to be enforced operationally.
4. **Forced alignment against the known ayah.** Instead of transcribing freely, score how well the audio aligns to the specific expected ayah. Robust and naturally word-level, but distinguishing a _similar wrong_ ayah from the correct one needs extra candidate scoring.
5. **Hybrid.** Recognition first for a quick verdict, then forced alignment when the result looks close, and phoneme-level scoring reserved for a future experimental mode.

The proof of concept is option 1's scaffolding pointed at option 3's model. The MVP is option 3. The long-term direction is the staged hybrid, with on-device recognition as a later privacy upgrade.

## The architecture I would ship first

The MVP keeps the client thin and the judgement conservative.

```text
Flutter (record 16kHz mono)
        │  multipart upload + expected ayah IDs
        ▼
FastAPI service (CPU)
   ├─ faster-whisper (tarteel-ai/whisper-base-ar-quran)
   │     initial_prompt = expected ayah text
   ├─ Normaliser (strip tashkeel, unify alif/hamza,
   │     drop tatweel, collapse whitespace)
   ├─ Comparator (word-sequence Levenshtein similarity)
   └─ Response: { status, similarity, recognized_text, word_diff }
```

The client records short segments with the `record` package, uploads only the expected ayah IDs — never the client's own copy of the text — and the server fetches the canonical text from bundled Tanzil data. Audio is processed in memory and discarded; only an anonymized correctness flag is logged. The matching layer normalizes both sides identically, computes a word-sequence similarity, then applies conservative confidence bands:

- High similarity → correct.
- Middle band with strong model confidence → partial, showing missing words only when the diff is small.
- Low similarity with strong confidence → wrong.
- Weak model confidence or almost no speech → low confidence, never asserted as wrong.

That last band matters more than the others. The religiously sensitive failure mode is a **false accept** — marking a wrong continuation as correct. So the design prefers an honest "not recognized with confidence, please try again" over false certainty in either direction. For verses that resemble others (the mutashabihat), the plan also scores against the nearest similar candidates and downgrades to low confidence when they are too close to separate.

## The risks worth naming out loud

The research surfaced three risks I want to hold onto rather than discover in production.

**False accepts undermine trust the most.** A user who is told a wrong recitation was correct loses faith in the whole feature, and the mistake is religiously uncomfortable. Conservative thresholds and similar-ayah scoring exist to push errors toward "uncertain" instead.

**Indonesian accents and children are under-represented in every public dataset.** The available corpora are dominated by adult male professional reciters. Ayatura's audience is largely Indonesian, so generalization has to be measured with real volunteers, not assumed. The proof-of-concept test plan is built around exactly that: correct, wrong-but-similar, and skipped-word recitations from both native-Arabic and Indonesian speakers, with target false-accept under 5%.

**Competing apps often claim more than their models deliver.** "Tajweed feedback" is a common marketing line that the underlying research does not fully support yet. Ayatura's positioning is not to become another full Quran app; it is to keep Next Verse as one focused, privacy-respecting feature inside the existing planning workflow.

## What this means for the feature

Nothing about this replaces the current design overnight. Next Verse stays honest self-assessment until a prototype proves the numbers hold on Ayatura's actual users. The value of the research is that it converts a vague ambition — "add voice recognition" — into a bounded, testable plan: a specific model, a specific matching method, explicit confidence bands, a concrete test protocol, and a clear list of things the MVP must _not_ claim.

If the proof of concept clears its false-accept target on Indonesian volunteers, verification becomes an optional layer on top of Next Verse, framed as an automated software check that can be wrong — not a religious verdict. If it does not, self-assessment remains the honest answer, and that is an acceptable outcome too.

The through-line with the rest of Ayatura is the same principle that shaped its offline-first, account-free design: keep the core value dependable, add capability only where it can be trusted, and never let a feature promise more than it can prove.

You can learn more and download the app at [ayatura.com](https://ayatura.com/).
