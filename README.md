# CCNA Daily

One CCNA 200-301 lesson per day. 60 days, full exam blueprint, quiz-gated, streak-tracked, works offline.

## What's inside

| File | Purpose |
|---|---|
| `index.html` | App shell + design system |
| `app.js` | Engine: streaks, quiz gate, spaced repetition, badges, backup |
| `lessons.js` | 60 lessons / 180 questions, weighted to the exam blueprint (FUND 15 · ACCESS 11 · IP 13 · SVC 8 · SEC 9 · AUTO 4) |
| `sw.js` | Service worker — offline cache |
| `.nojekyll` | Tells GitHub Pages to skip Jekyll (fixes stuck/failed builds) |
| `manifest.json` + icons | PWA install metadata |

## Deploy (same playbook as Santos Lawn Care)

1. Repo: `AvoBrandon/ccna`
2. Upload all 8 files to the repo root
3. Settings → Pages → Deploy from branch → `main` / root → Save
4. Wait ~1 min → open `https://avobrandon.github.io/ccna/`

## Install on your iPhone

Open the URL in **Safari** → Share → **Add to Home Screen**. Launch it from the icon (not Safari) — that's what unlocks standalone mode, notifications, and the app badge.

## Daily reminder (do this once, 2 minutes)

iOS won't let a web app fire scheduled pushes without a server, so the guaranteed reminder is a Shortcuts automation:

1. In the app: ⚙︎ → **Enable notifications** → allow (activates the red app badge whenever today's lesson is unfinished — iOS 16.4+)
2. **Shortcuts** app → Automation → **+** → **Time of Day** → pick your study time → Daily → **Run Immediately**
3. Action: **Open App** → **CCNA Daily**

Every day at that time your phone opens straight into the lesson, and the badge nags you until it's done.

## How it works

- **One new lesson/day**, sequential. Pass the 3-question check **3/3** to complete it (options reshuffle on retry).
- **Streak** counts consecutive days; missing a day resets it. After day 60 the app switches to **maintenance mode** — a daily 5-question mixed drill (pass 4/5) keeps the streak alive forever.
- **Smart Review**: every missed question returns on a 1 → 3 → 7 → 14 → 30 day schedule until you graduate it. **Quick 5** gives extra reps anytime.
- **Subnet Drill** (v2): infinite procedurally-generated subnetting problems — network/broadcast addresses, host ranges, mask ↔ prefix — with run-streak tracking. The most-tested CCNA skill, unlimited reps.
- **REF tab** (v2): quick-reference tables — ports, AD values, subnet cheat table, STP/OSPF timers, FHRP MACs, go-to show commands.
- **Stats** tab: streaks, accuracy, 18 badges, domain mastery, and a 12-week activity heatmap (v2).
- **Library search** (v2): filter all 60 lessons instantly.
- Tap any lit node on the topology map to reread that lesson.

## Progress & backup

Progress saves automatically on-device (localStorage — persistent for installed home-screen apps). It does **not** sync between devices, so grab a backup occasionally: ⚙︎ → **Copy backup** → paste into Notes. Restore on any device with **Restore…**.

## Updating the app later

If you edit any file, bump the version in `sw.js` (`ccna-daily-v1` → `-v2`) so installed phones fetch the update. Force-refresh: close the app fully and reopen twice.

## Troubleshooting

- **No notification prompt** → must be launched from the Home Screen icon, iOS 16.4+.
- **Blank screen after an update** → bump the cache version (above) or remove/re-add to Home Screen (export a backup first).
- **Date/exam countdown looks off** → the app uses your phone's local date.
