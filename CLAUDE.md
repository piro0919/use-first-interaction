# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**use-first-interaction** reports the first time a visitor touches the page, so
third parties load then rather than during the first paint. Its differentiator
over a bare `useEffect`: the delay after the interaction, the event list that
includes scrolling, SSR-safe first render, and listeners that come off as soon
as one fires.

- **npm package:** use-first-interaction
- **Demo site:** <https://use-first-interaction.kkweb.io>

## Tech Stack

- TypeScript 5, React as a peer dependency, nothing else
- Next.js 16 (App Router) — demo site only
- Biome (linter/formatter)
- tsup (library build, ESM + CJS)
- Vitest with jsdom and Testing Library — tests
- Vercel (deployment)

## Project Structure

```text
src/
├── index.ts                   # public API
├── events.ts                  # the default event list and the options type
├── useFirstInteraction.ts     # the hook
├── useOnFirstInteraction.ts   # run something once
└── app/                       # Next.js App Router (demo site)
tests/
assets/                        # Bricolage Grotesque subset for the Open Graph card
```

## Design notes

- **The hook starts `false` on both sides of hydration.** Reading anything about
  the visitor during the first render would change what React compares.
- **Listeners are passive.** A non-passive `scroll` listener holds up the scroll
  it is watching, which is the opposite of the point.
- **The event list is compared by contents, not identity.** Callers pass a fresh
  array every render; re-registering the listeners each time would drop an
  interaction that lands in between.
- **`timeout` is off by default.** Firing anyway after a while brings back the
  visitor you were deferring for.
- **The callback's failure is reported, not swallowed and not left loose.** A
  dynamic import of a third party that is having a bad day should not surface as
  an unhandled rejection in someone else's application.
- **tsup's treeshake pass drops the `"use client"` banner**, so this build does
  not treeshake. Three modules of hooks have nothing to shake.

## Demo site

`_components/deferred-demo.tsx` really does defer a dynamic import, and the
figures are `performance.now()` either side of the interaction. Everything that
watches lives in `Probe` so "arm it again" is a remount. After the first load
the chunk is cached and the second fetch is instant — that is the browser, not
the demo lying.

## Commands

```bash
pnpm dev         # demo site
pnpm test        # vitest
pnpm typecheck   # tsc --noEmit
pnpm lint        # biome check
pnpm build:lib   # tsup -> dist
pnpm build       # next build (demo site)
```

## Testing

jsdom plus Testing Library's `renderHook`, with fake timers for the delay and
timeout cases. Assert on which event names were removed rather than on a call
count: the effect re-runs when the interaction reports, so the listeners come
off twice, and counting them makes the test fail for no reason.

When changing the hook, break it deliberately and confirm the tests fail before
restoring.

## Releasing

Bump `version` in `package.json`, add a `CHANGELOG.md` entry, then push a
`vX.Y.Z` tag. The publish workflow checks the tag against `package.json`.
