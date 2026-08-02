# Path-GeniX (Frontend-Only)

Path-GeniX is a UI-first career discovery app built with Next.js, React, and Tailwind.

This project now runs in **frontend-only mode**:
- No backend runtime
- No database
- No external AI API calls
- Local persistence via browser `localStorage`

## What Works

All major screens remain functional with deterministic local logic:
- InsightX Assessment
- PathXplore Career Suggestions
- GoalMint Planner
- MentorSuite Chat
- Reports
- Parent Quiz

## How Data Works

- App state is stored under one key in browser storage (`path-genix-ui-state-v1`).
- Data is persisted per browser/device only.
- A default demo user is created locally for instant usage.
- Sign up / login are simulated locally (no remote auth provider).

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open:

`http://localhost:9002`

No environment variables are required for core app functionality.

## Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run typecheck` — TypeScript check

## Notes

- This version is intentionally UI-only and suitable for demos/prototyping.
- Security, multi-user isolation, and cross-device sync are out of scope in this mode.
