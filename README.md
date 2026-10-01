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

React 18 or newer — tested on 18 and 19. No dependencies.

## `useFirstInteraction(options?)`

`false` until the first `keydown`, `pointerdown`, `scroll`, `touchstart` or
`wheel` on the page, then `true` for good. It is `false` on the server and on
the first client render, so it never changes what hydration compares.

The interaction is recorded once for the whole page and shared by every hook.
A component that mounts after it — on another route, or mounted again — turns
`true` straight after its first render instead of waiting for another one.

| Option | Default | |
| ---- | ---- | ---- |
| `delay` | `0` | wait this many milliseconds after the interaction before reporting it |
| `events` | the five above | what to listen for |
| `timeout` | — | report the interaction anyway after this long |
| `disabled` | `false` | report nothing at all |

**`delay`.** The interaction itself is the frame the visitor cares most about,
and the one moment not to spend on a third party. Two or three seconds after it
is usually invisible to them and early enough for the tag.

The delay counts from the interaction, not from the mount: a component that
mounts 1.5 seconds after the interaction with `delay: 2500` turns `true` one
second later.

**`events`.** `scroll` is on the list because a reader who only reads never
presses anything. `pointerdown` covers mouse, pen and touch; `touchstart` is
kept for browsers without pointer events.

Each hook only counts its own events. Two hooks with different lists share the
record, but a `scroll` does not turn on a hook that only listens for `keydown`.
An event counts if some hook on the page was listening for it when it happened.

**`timeout`.** Off by default. A visitor who leaves without touching anything is
exactly the one you did not want to load for — but if the tag has to fire on
every visit, set it and be honest about the trade.

It counts from the start of the page (`performance.now()`), not from the mount,
so a remount or a change of options does not start it again.

**`disabled`.** For switching the deferred work off in development, where a
recorder session per hot reload helps no one. A disabled hook reports `false`
and listens for nothing.

Changing an option re-reads the shared record with the new values; an
interaction that already happened is never lost by it.

## `useOnFirstInteraction(callback, options?)`

Runs the callback once the interaction is reported, and returns the same
boolean. It takes the options above, plus `id`.

```tsx
useOnFirstInteraction(async () => {
  const { hotjar } = await import("react-hotjar");

  hotjar.initialize({ id, sv });
}, { delay: 2500, id: "hotjar" });
```

A component that mounts after the interaction runs the callback straight away.

**`id`.** Without it the callback runs once per mounted component, so unmounting
and mounting the component again runs it again. Give anything that must not
start twice — a recorder, a chat widget — an `id`: callbacks under the same
`id` run once per page load, however many times or in however many places the
hook mounts.

The callback is read through a ref, so passing a new function on every render
does not run it again. If it throws or rejects, the reason goes to the console
rather than becoming an unhandled rejection in your application.

## Listeners

There is one set for the whole page, however many hooks are mounted. They are
registered on `window` in the capture phase, so a `scroll` on an inner element
— which does not bubble — and an event whose propagation was stopped are both
heard. They are passive, because a non-passive `scroll` listener holds up the
scroll it is watching. Each comes off as soon as no mounted hook is waiting for
it.

## What this is not

**Not a consent gate.** Deferring a tracker changes when it loads, not whether
you were allowed to load it.

**Not lazy rendering.** For something that should appear when it scrolls into
view, an intersection observer is the right instrument.

## Licence

MIT
