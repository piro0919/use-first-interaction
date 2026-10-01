/**
 * One record of the first interaction for the whole page, shared by every hook.
 *
 * Each event name is stamped with the `performance.now()` of the first time it
 * was seen. A hook asks for the earliest stamp among its own events, so two
 * hooks with different event lists both stay correct: a `scroll` never turns on
 * a hook that only listens for `keydown`.
 *
 * Window listeners are shared too. An event name is listened for while some
 * subscribed hook still has none of its events stamped, and comes off as soon
 * as no hook is waiting for it.
 *
 * Nothing in this module touches `window` until a hook subscribes, which only
 * happens in the browser.
 */

type Subscriber = {
  names: readonly string[];
  notify: () => void;
};

/* Capture phase, so an event that does not bubble (`scroll` on an inner
   element) or whose propagation is stopped still passes through the window on
   its way down. Passive, because a non-passive scroll listener holds up the
   scroll it is watching. */
const LISTEN: AddEventListenerOptions = { capture: true, passive: true };
const UNLISTEN: EventListenerOptions = { capture: true };

const seen = new Map<string, number>();
const subscribers = new Set<Subscriber>();
const listening = new Set<string>();
const claimed = new Set<string>();

function record(event: Event): void {
  if (seen.has(event.type)) return;

  seen.set(event.type, performance.now());
  reconcile();

  for (const subscriber of [...subscribers]) {
    subscriber.notify();
  }
}

/** Put on exactly the listeners that some waiting hook still needs. */
function reconcile(): void {
  const needed = new Set<string>();

  for (const subscriber of subscribers) {
    if (seenAt(subscriber.names) !== null) continue;

    for (const name of subscriber.names) {
      needed.add(name);
    }
  }

  for (const name of listening) {
    if (needed.has(name)) continue;

    window.removeEventListener(name, record, UNLISTEN);
    listening.delete(name);
  }

  for (const name of needed) {
    if (listening.has(name)) continue;

    window.addEventListener(name, record, LISTEN);
    listening.add(name);
  }
}

/** When the earliest of these events first happened, or `null` if none has. */
export function seenAt(names: readonly string[]): null | number {
  let first: null | number = null;

  for (const name of names) {
    const at = seen.get(name);

    if (at !== undefined && (first === null || at < first)) first = at;
  }

  return first;
}

export function subscribe(
  names: readonly string[],
  notify: () => void,
): () => void {
  const subscriber: Subscriber = { names, notify };

  subscribers.add(subscriber);
  reconcile();

  return () => {
    subscribers.delete(subscriber);
    reconcile();
  };
}

/**
 * `true` the first time an id is claimed on this page, `false` after that.
 * This is what keeps `useOnFirstInteraction({ id })` to one run per page load.
 */
export function claim(id: string): boolean {
  if (claimed.has(id)) return false;

  claimed.add(id);

  return true;
}

/** Forget everything. For tests only; not exported from the package. */
export function reset(): void {
  for (const name of listening) {
    window.removeEventListener(name, record, UNLISTEN);
  }

  listening.clear();
  seen.clear();
  subscribers.clear();
  claimed.clear();
}
