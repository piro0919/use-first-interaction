"use client";

import { useEffect, useState } from "react";
import { DEFAULT_EVENTS, type FirstInteractionOptions } from "./events";

/**
 * `false` until the visitor first touches the page, then `true` for good.
 *
 * ```tsx
 * const interacted = useFirstInteraction({ delay: 2500 });
 *
 * return interacted ? <Analytics /> : null;
 * ```
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
  const [interacted, setInteracted] = useState(false);
  /* The event list is usually a fresh array on every render. Comparing its
     contents keeps that from tearing the listeners down and putting them back
     each time — which would drop an interaction that lands in between. */
  const key = events.join(",");

  useEffect(() => {
    if (disabled || interacted) return;

    let settle: null | ReturnType<typeof setTimeout> = null;
    let expiry: null | ReturnType<typeof setTimeout> = null;
    const names = key === "" ? [] : key.split(",");

    const stop = (): void => {
      for (const name of names) {
        window.removeEventListener(name, handle);
      }
    };

    function handle(): void {
      stop();

      if (expiry !== null) clearTimeout(expiry);

      if (delay <= 0) {
        setInteracted(true);

        return;
      }

      settle = setTimeout(() => setInteracted(true), delay);
    }

    for (const name of names) {
      /* Passive: none of these listeners calls preventDefault, and a
         non-passive scroll listener holds up the scroll it is watching. */
      window.addEventListener(name, handle, { passive: true });
    }

    if (timeout !== undefined) {
      expiry = setTimeout(() => {
        stop();
        setInteracted(true);
      }, timeout);
    }

    return () => {
      stop();

      if (settle !== null) clearTimeout(settle);

      if (expiry !== null) clearTimeout(expiry);
    };
  }, [delay, disabled, interacted, key, timeout]);

  return interacted;
}
