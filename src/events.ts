/**
 * The events that count as "the visitor is here".
 *
 * `pointerdown` covers mouse, pen and touch on every browser that has pointer
 * events; `touchstart` is kept for the ones that do not. `scroll` is on the
 * list because a reader who only reads never presses anything.
 */
export const DEFAULT_EVENTS = [
  "keydown",
  "pointerdown",
  "scroll",
  "touchstart",
  "wheel",
] as const;

export type FirstInteractionOptions = {
  /**
   * Wait this many milliseconds after the interaction before reporting it.
   * The interaction itself is usually the frame the visitor cares most about;
   * loading something in it is the one moment to avoid.
   */
  delay?: number;
  /** Events to listen for. Defaults to {@link DEFAULT_EVENTS}. */
  events?: readonly string[];
  /** Report nothing at all. For turning the deferred work off in development. */
  disabled?: boolean;
  /**
   * Report the interaction after this many milliseconds even if none happened,
   * counted from the start of the page (`performance.now()`), so remounting or
   * changing options does not restart it. Off by default: a visitor who leaves
   * without touching anything is exactly the one you did not want to load for.
   */
  timeout?: number;
};

export type OnFirstInteractionOptions = FirstInteractionOptions & {
  /**
   * Run at most once per page load under this name, however many times the
   * component mounts. Without it the callback runs once per mounted component.
   */
  id?: string;
};
