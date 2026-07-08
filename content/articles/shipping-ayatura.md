---
title: 'Building Ayatura: turning Quran memorization into a daily system'
slug: 'shipping-ayatura'
description: 'How I designed and built Ayatura, an offline-first Flutter app that distributes a Muslim’s Quran memorization across daily prayers and adds a focused recall practice loop.'
date: '2026-07-07'
category: 'Indie Dev'
tags:
  - indie-dev
  - flutter
  - product-engineering
  - quran
status: 'published'
author: 'Rifan Fauzi'
cover: '/images/articles/ayatura/feature-graphic.png'
---

Memorizing part of the Quran creates a second responsibility: keeping it available in memory. A passage can feel secure after focused repetition and still become harder to recall when it is not revisited consistently.

I built [Ayatura](https://ayatura.com/) to turn that maintenance work into a practical daily system. The app takes everything a Muslim has memorized, distributes it across the five daily prayers, and produces a monthly plan for regular review. It also provides a Quran reader, home-screen widgets, and a Next Verse practice mode for active recall.

Ayatura is free on [iOS](https://apps.apple.com/us/app/ayatura-daily-surah-planner/id6770778104) and [Android](https://play.google.com/store/apps/details?id=com.ayatura.app). It requires no account, contains no ads, and keeps its core planning data on the device.

## The product idea

The product started with a simple observation: prayer already gives Muslims five stable moments every day. Instead of creating another reminder system, Ayatura uses that existing rhythm as the structure for reviewing memorized Quran.

The basic workflow has three steps:

1. Add the Quran content you have memorized.
2. Generate a monthly plan across Fajr, Dhuhr, Asr, Maghrib, and Isha.
3. Read, listen, or recite the assigned content before or during prayer.

The app is not limited to people who have memorized full surahs. A hifdh entry can represent a complete surah, a verse range, a Juz and page selection, or multiple entries added in bulk from a Juz. The planner works with the material the user actually knows.

That flexibility matters because memorization does not follow one universal structure. Some people progress surah by surah. Others work by page, Juz, or selected passages. The data model has to preserve those boundaries instead of flattening everything into a list of surah IDs.

![Ayatura Hifdh screen showing memorized entries and progress statistics.](/images/articles/ayatura/hifdh-list.png)

_The hifdh list is the source pool for planning, reading, widgets, and recall practice._

## From a hifdh list to a monthly plan

The central engineering problem is distribution. Given a pool of enabled hifdh entries, how should the app fill every prayer slot for a month without repeatedly favoring the same material?

Ayatura models the enabled entries as a deck. The deck can be ordered from the beginning of the Quran, from the end, or randomly. The generator walks that queue and assigns entries to prayer slots until the month is full.

```dart
final orderedPool = orderPoolEntries(
  enabledPool,
  assignmentOrder,
  random: random,
)

final perSlot = min(
  surahsPerPrayer.clamp(1, PlanLimits.maxSurahsPerPrayerSlot),
  orderedPool.length,
)
```

The implementation applies several rules around that simple loop:

- Every entry should appear before a new full cycle begins.
- The same entry should not repeat within one day when the pool is large enough.
- A locked prayer slot must survive regeneration unchanged.
- Locked entries do not consume positions from the generated queue.
- Past days can remain fixed when the current month is regenerated.
- An unfinished deck carries into the next month before a fresh cycle starts.

The last rule is easy to miss. If a month ends halfway through the pool, restarting from the first entry next month would quietly favor the beginning forever. Ayatura stores a small deck snapshot with the ordered entry keys and next cursor position. The next month completes that remaining cycle first.

```dart
final remainingKeys = previousSnapshot.cycleEntryKeys
    .sublist(previousSnapshot.nextIndex)
    .where(poolByKey.containsKey)
    .toList()

if (remainingKeys.isEmpty) return null

return (
  queue: orderPoolEntries(remainingEntries, assignmentOrder),
  firstCycleOnly: true,
  cursor: 0,
)
```

This is less about mathematical perfection than predictable fairness. Users can still regenerate a plan, shuffle an individual prayer, or lock a day or slot. The algorithm provides a balanced default without taking control away.

![Ayatura monthly plan with Quran assignments distributed across the five daily prayers.](/images/articles/ayatura/month-plan.png)

_A generated month stays editable: prayer slots can be locked, shuffled, or regenerated._

## The architecture follows the privacy model

Ayatura does not require an account because its main job does not require a server. The hifdh list, generated plans, prayer times, settings, and practice history live in a local SQLite database managed through Drift.

```text
Flutter UI
    │
    ▼
Riverpod providers
    │
    ├── plan generation and practice services
    ├── Quran reader and audio services
    └── widget synchronization
    │
    ▼
Drift / SQLite on the device
```

Riverpod providers connect screens to the database and domain services. Regenerating a plan, for example, loads the enabled pool and previous plan, applies settings and lock rules, runs the generator, saves the result, invalidates derived insight data, and refreshes the home-screen widget.

This local-first architecture has product consequences:

| Capability                            | Source               | Network required? |
| ------------------------------------- | -------------------- | ----------------- |
| Hifdh list and monthly plans          | Local SQLite         | No                |
| Indonesian Quran text and translation | Bundled Kemenag data | No                |
| Juz and Madinah page mapping          | Bundled static data  | No                |
| English translation                   | Quran.com            | Yes               |
| Recitation audio                      | EveryAyah            | Yes               |
| Home-screen prayer plan               | Local widget payload | No                |

The boundary is explicit. Core planning remains useful offline. Features that depend on external content can fail independently without making the planner unavailable.

## Reading directly from the plan

A plan is only useful if acting on it is easy. Each assignment opens directly into a Quran reader rather than asking the user to find the passage again.

The reader handles full surahs and selected ranges, Arabic text, localized translations, and optional recitation audio. Indonesian content comes from Kemenag data stored inside the app. English translation is fetched from Quran.com when online, while audio streams from EveryAyah with a choice of reciter.

Page-based hifdh introduced another build-time data problem. The app needs to translate a Madinah mushaf page into concrete surah and verse boundaries without making a request during normal use. Ayatura bundles a 604-page map generated ahead of time, so Juz and page selection resolves locally.

That is a recurring design choice in the project: if reference data is stable, generate or bundle it once rather than turning every user action into a network dependency.

## Keeping the next prayer visible

Ayatura also publishes a small localized payload to native iOS and Android home-screen widgets. The payload includes the current plan, prayer times, translated labels, and a seven-day window so the widget can show the current and next prayer without launching Flutter.

The synchronization service is deliberately defensive. Widget updates run after plan changes, but failures are caught and logged because a platform widget must never break the primary user flow.

```dart
try {
  await HomeWidget.saveWidgetData<String>(
    widgetPayloadKey,
    jsonEncode(payload),
  )
  await _updateHomeWidgets()
} catch (error, stackTrace) {
  debugPrint('WidgetSyncService.sync failed: $error\n$stackTrace')
}
```

This is a small example of a broader rule: integrations are secondary. The planner remains the system of record, and platform surfaces receive projections of that state.

## Next Verse is a different kind of review

Scheduled exposure and active recall solve different problems. The monthly planner ensures breadth: everything returns regularly. Next Verse practice tests whether the next passage can be recalled from a prompt.

For each session, the user chooses hifdh entries, a question count, and optional audio. The generator expands those entries into playable verses, identifies valid prompt-and-answer sequences, shuffles the candidates, and creates the requested rounds.

```dart
for (
  var firstAnswerAyah = minAyah + 1;
  firstAnswerAyah <= maxAyah;
  firstAnswerAyah++
) {
  if (!ayahs.contains(firstAnswerAyah)) continue
  final count = preferredAnswerCount.clamp(
    1,
    maxAyah - firstAnswerAyah + 1,
  )
  final answerAyat = List.generate(
    count,
    (index) => firstAnswerAyah + index,
  )
  if (!answerAyat.every(ayahs.contains)) continue

  final givenAyah = firstAnswerAyah - 1
  if (!ayahs.contains(givenAyah)) continue

  candidates.add(
    _RoundCandidate(
      surahId: surahId,
      givenAyat: [givenAyah],
      answerAyat: answerAyat,
    ),
  )
}
```

The user reads or listens to the prompt, recites the continuation, reveals the answer, and marks the result. Completed sessions feed streak, accuracy, and most-missed-verse insights. This keeps the feature honest: Ayatura records self-assessment, not a claim that a speech model can judge Quran recitation correctly.

![Ayatura Next Verse practice showing a Quran prompt, answer controls, and session progress.](/images/articles/ayatura/next-verse.png)

_Next Verse adds active recall to the broader repetition provided by the monthly plan._

## Building one product across Flutter and native surfaces

The app uses Flutter and Material 3 for the main iOS and Android experience. Riverpod manages application state, Drift manages SQLite persistence, ARB files provide English and Indonesian localization, and native home widgets consume the shared payload.

The codebase keeps domain logic outside widgets. Plan generation, Quran page resolution, label formatting, analytics, and practice-round construction are plain Dart services with focused unit tests. UI flows use stable semantics identifiers so Maestro can exercise navigation and core journeys across localized builds.

That separation matters most in the planning algorithm. A month generator should be testable with a deterministic clock and random source, without rendering a screen or opening a database. The same applies to the Next Verse candidate builder and widget payload formatter.

The project now has tests around plan persistence, fair distribution, locks, Juz and page ranges, Quran data formatting, widget synchronization, Next Verse rounds, streaks, and analytics. The testing surface grew with the product because the cost of a subtle plan error is higher than a visual bug.

## Product constraints I chose deliberately

Ayatura is offline-first, account-free, and ad-free by design. Those are not only positioning statements. They shape the implementation.

No account removes onboarding and credential management. No cloud dependency keeps private memorization data on the device. No ads keeps the interface calm in a context where attention matters. Local persistence makes the app useful in a mosque, while traveling, or anywhere connectivity is unreliable.

There are trade-offs. Without cloud sync, reinstalling or changing devices does not automatically restore data. English translations and audio still need a connection. Prayer times and Qibla direction require platform permissions and device data. The goal is not to pretend the network does not exist; it is to keep the core value independent from it.

## What I learned from building Ayatura

The most important product decision was to design around an existing behavior instead of inventing a new one. Five daily prayers already provide cadence, context, and repetition. Ayatura turns that rhythm into a review plan.

The most important engineering decision was to make the plan a durable local model rather than a temporary screen. Once plans, locks, deck state, prayer times, and hifdh entries have clear representations, the reader, widgets, insights, and practice mode can all build on the same source of truth.

Ayatura is still evolving, but its purpose remains narrow: help Muslims keep what they have memorized active, one prayer and one month at a time.

You can learn more and download the app at [ayatura.com](https://ayatura.com/).
