"use client";

import { useEffect, useRef } from "react";
import type { OnFirstInteractionOptions } from "./events";
import { claim } from "./store";
import { useFirstInteraction } from "./useFirstInteraction";

/**
 * Run something once, the first time the visitor touches the page.
 *
 * ```tsx
 * useOnFirstInteraction(async () => {
 *   const { hotjar } = await import("react-hotjar");
 *
 *   hotjar.initialize({ id, sv });
 * }, { delay: 2500, id: "hotjar" });
 * ```
 *
 * A component that mounts after the interaction runs the callback straight
 * away. Without `id` that is once per mounted component, so a remount runs it
 * again; with `id` it is once per page load, whichever component gets there
 * first.
 *
 * The callback is read through a ref, so passing a new function on every render
 * does not run it again. If it rejects — a dynamic import of a third party that
 * is having a bad day — the reason is reported to the console rather than left
 * as an unhandled rejection in someone else's application.
 */
export function useOnFirstInteraction(
  callback: () => unknown,
  { id, ...options }: OnFirstInteractionOptions = {},
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

    if (id !== undefined && !claim(id)) return;

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
  }, [id, interacted]);

  return interacted;
}
