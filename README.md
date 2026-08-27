# use-first-interaction

A React hook that reports the first time a visitor touches the page.

```tsx
import { useFirstInteraction } from "use-first-interaction";

export default function Analytics() {
  const interacted = useFirstInteraction({ delay: 2500 });

  return interacted ? <Tag /> : null;
}
```

Analytics, chat widgets and heatmap recorders do not need to be in the first
paint. They need to be there by the time someone is actually using the page.

<https://use-first-interaction.kkweb.io> loads a real chunk this way, and shows
what it cost.

## Install

```bash
npm install use-first-interaction
```

React 18 or newer. No dependencies.

## `useFirstInteraction(options?)`

`false` until the first `keydown`, `pointerdown`, `scroll`, `touchstart` or
`wheel` on the window, then `true` for good. It is `false` on the server and on
the first client render, so it never changes what hydration compares.

| Option | Default | |
| ---- | ---- | ---- |
| `delay` | `0` | wait this many milliseconds after the interaction before reporting it |
| `events` | the five above | what to listen for |
| `timeout` | — | report the interaction anyway after this long |
| `disabled` | `false` | report nothing at all |

**`delay`.** The interaction itself is the frame the visitor cares most about,
and the one moment not to spend on a third party. Two or three seconds after it
is usually invisible to them and early enough for the tag.

**`events`.** `scroll` is on the list because a reader who only reads never
presses anything. `pointerdown` covers mouse, pen and touch; `touchstart` is
kept for browsers without pointer events.

**`timeout`.** Off by default. A visitor who leaves without touching anything is
exactly the one you did not want to load for — but if the tag has to fire on
every visit, set it and be honest about the trade.

**`disabled`.** For switching the deferred work off in development, where a
recorder session per hot reload helps no one.

## `useOnFirstInteraction(callback, options?)`

Runs the callback once, and returns the same boolean.

```tsx
useOnFirstInteraction(async () => {
  const { hotjar } = await import("react-hotjar");

  hotjar.initialize({ id, sv });
}, { delay: 2500 });
```

The callback is read through a ref, so passing a new function on every render
does not run it again. If it throws or rejects, the reason goes to the console
rather than becoming an unhandled rejection in your application.

## Listeners

They are registered on `window` and passive — a non-passive `scroll` listener
holds up the scroll it is watching — and they are removed the moment one of them
fires.

## What this is not

**Not a consent gate.** Deferring a tracker changes when it loads, not whether
you were allowed to load it.

**Not lazy rendering.** For something that should appear when it scrolls into
view, an intersection observer is the right instrument.

## Licence

MIT
