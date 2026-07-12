# Tobby Tabi

A mobile-first Progressive Web App (PWA) built for teachers at **Tobby Tabby Bilingual Nursery and Primary School** to send parent updates over WhatsApp — without any backend or server.

## What it does

- **Student Progress Updates** — send an individual, formatted WhatsApp update to each parent (academic progress, behaviour, attendance, strengths, areas for improvement).
- **Weekly Class Update** — send a single weekly summary (subjects covered, announcements) to the class WhatsApp group.
- **Deadline Reminders** — local notifications a day before, a few hours before, and 1 hour before the Friday 11:59 PM deadline, for both student updates and the weekly message. Includes snooze.
- **Notification Center** — bell icon with unread badge, mark-all-read, clear-all.
- **My Activity** — a calendar view of what was sent and when, monthly stats, and a weekly on-time streak.
- **Installable** — works offline after first load, installable to the home screen on Android and iOS.

## Tech stack

Plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no server. Data is stored entirely on-device via `localStorage`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The entire app — markup, styles, and logic |
| `sw.js` | Service worker: offline caching + notification handling |
| `manifest.json` | PWA manifest (icons, name, display mode) |
| `logo.png` | App/school logo, used across splash screen, top bar, and install prompt |

## Hosting (GitHub Pages)

1. Repo **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → **Save**.
2. Your app will be live at `https://<username>.github.io/<repo-name>/`.
3. Open the link on a phone and **Add to Home Screen** for the full app-like experience.

## Notes

- All data (students, settings, activity history) lives in the browser's `localStorage` on the device it was set up on — nothing syncs across devices.
- Notifications work best while the app is open or recently backgrounded. Full background delivery (even after the app is fully closed) requires wrapping the app natively (e.g. with Capacitor) or adding a real push server later — the code is already structured to support that upgrade.
