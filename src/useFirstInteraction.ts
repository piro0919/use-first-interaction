"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { DEFAULT_EVENTS, type FirstInteractionOptions } from "./events";
import { seenAt, subscribe } from "./store";

const NOTHING_ON_THE_SERVER = (): null => null;

/**
 * `false` until the visitor first touches the page, then `true` for good.
 *
 * ```tsx
 * const interacted = useFirstInteraction({ delay: 2500 });
 *
 * return interacted ? <Analytics /> : null;
 * ```
 *
 * The interaction is recorded once for the whole page, so a component that
 * mounts after it — or mounts again — does not wait for another one.
 *
 * It is `false` on the server and on the first client render, so it never
 * changes what hydration compares.
 */
export function useFirstInteraction({
  delay = 0,
  disabled = false,
  events = DEFAULT_EVENTS,
  timeout,
}: FirstInteractionOptions = {}): boolean {
  /* The event list is usually a fresh array on every render. Comparing its
     contents keeps that from unsubscribing and subscribing again each time. */
  const key = disabled ? "" : events.join(",");
  const names = useMemo(() => (key === "" ? [] : key.split(",")), [key]);
  const listen = useCallback(
    (notify: () => void) => subscribe(names, notify),
    [names],
  );
  const read = useCallback(() => seenAt(names), [names]);
  const interactedAt = useSyncExternalStore(
    listen,
    read,
    NOTHING_ON_THE_SERVER,
  );

  /* Both deadlines are absolute `performance.now()` times: the interaction is
     kept by the shared record, and `timeout` counts from the page's start. A
     change of options or a remount works out the same deadline again instead
     of losing a pending delay or restarting the timeout. */
  let due: null | number = null;

  if (!disabled) {
    if (interactedAt !== null) due = interactedAt + delay;

    if (timeout !== undefined && (due === null || timeout < due)) {
      due = timeout;
    }
  }

  /* `null` until the first effect, so the first render is `false` everywhere. */
  const [now, setNow] = useState<null | number>(null);

  useEffect(() => {
    if (due === null) return;

    const left = due - performance.now();

    if (left <= 0) {
      setNow(performance.now());

      return;
    }

    const timer = setTimeout(
      () => setNow(Math.max(performance.now(), due)),
      left,
    );

    return () => clearTimeout(timer);
  }, [due]);

  return due !== null && now !== null && now >= due;
}
