"use client";

import { useEffect, useRef } from "react";
import type { FirstInteractionOptions } from "./events";
import { useFirstInteraction } from "./useFirstInteraction";

/**
 * Run something once, the first time the visitor touches the page.
 *
 * ```tsx
 * useOnFirstInteraction(async () => {
 *   const { hotjar } = await import("react-hotjar");
 *
 *   hotjar.initialize({ id, sv });
 * }, { delay: 2500 });
 * ```
 *
 * The callback is read through a ref, so passing a new function on every render
 * does not run it again. If it rejects — a dynamic import of a third party that
 * is having a bad day — the reason is reported to the console rather than left
 * as an unhandled rejection in someone else's application.
 */
export function useOnFirstInteraction(
  callback: () => unknown,
  options: FirstInteractionOptions = {},
): boolean {
  const interacted = useFirstInteraction(options);
  const latest = useRef(callback);
  const done = useRef(false);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!interacted || done.current) return;

    done.current = true;

    try {
      const running = latest.current();

      if (running instanceof Promise) {
        running.catch((reason: unknown) => {
          console.error("useOnFirstInteraction: the callback rejected", reason);
        });
      }
    } catch (reason) {
      console.error("useOnFirstInteraction: the callback threw", reason);
    }
  }, [interacted]);

  return interacted;
}
