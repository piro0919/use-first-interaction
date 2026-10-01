import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_EVENTS } from "../src/events";
import { useFirstInteraction } from "../src/useFirstInteraction";

function interact(type = "pointerdown"): void {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useFirstInteraction", () => {
  it("is false until something happens", () => {
    const { result } = renderHook(() => useFirstInteraction());

    expect(result.current).toBe(false);
  });

  it("turns true on the first interaction", () => {
    const { result } = renderHook(() => useFirstInteraction());

    interact();

    expect(result.current).toBe(true);
  });

  it("listens for every default event", () => {
    for (const type of DEFAULT_EVENTS) {
      const { result } = renderHook(() => useFirstInteraction());

      interact(type);

      expect(result.current).toBe(true);
    }
  });

  it("waits out the delay before reporting", () => {
    const { result } = renderHook(() => useFirstInteraction({ delay: 2500 }));

    interact();

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current).toBe(true);
  });

  it("stays true once it is true", () => {
    const { rerender, result } = renderHook(() => useFirstInteraction());

    interact();
    rerender();

    expect(result.current).toBe(true);
  });

  it("stops listening once it has fired", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { result } = renderHook(() => useFirstInteraction());

    interact();

    const removed = new Set(remove.mock.calls.map((call) => call[0]));

    expect(result.current).toBe(true);

    for (const type of DEFAULT_EVENTS) {
      expect(removed.has(type)).toBe(true);
    }
  });

  it("listens passively, so a scroll listener cannot hold up the scroll", () => {
    const add = vi.spyOn(window, "addEventListener");

    renderHook(() => useFirstInteraction());

    for (const call of add.mock.calls) {
      expect(call[2]).toEqual({ passive: true });
    }
  });

  it("reports nothing when disabled", () => {
    const { result } = renderHook(() =>
      useFirstInteraction({ disabled: true }),
    );

    interact();

    expect(result.current).toBe(false);
  });

  it("takes a narrower event list", () => {
    const { result } = renderHook(() =>
      useFirstInteraction({ events: ["keydown"] }),
    );

    interact("scroll");

    expect(result.current).toBe(false);

    interact("keydown");

    expect(result.current).toBe(true);
  });

  it("keeps its listeners when the event list is a new array of the same events", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { rerender } = renderHook(() =>
      useFirstInteraction({ events: ["keydown"] }),
    );

    rerender();

    /* A re-render that tears the listeners down and puts them back drops any
       interaction that lands in between. */
    expect(remove).not.toHaveBeenCalled();
  });

  it("gives up waiting after the timeout, when one is set", () => {
    const { result } = renderHook(() => useFirstInteraction({ timeout: 8000 }));

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(result.current).toBe(true);
  });

  it("waits forever by default, because a visitor who never touches anything is the point", () => {
    const { result } = renderHook(() => useFirstInteraction());

    act(() => {
      vi.advanceTimersByTime(600_000);
    });

    expect(result.current).toBe(false);
  });

  it("does not fire the timeout after an interaction already reported", () => {
    const { result } = renderHook(() =>
      useFirstInteraction({ delay: 1000, timeout: 5000 }),
    );

    interact();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it("cleans up when the component goes away", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useFirstInteraction());

    unmount();

    const removed = new Set(remove.mock.calls.map((call) => call[0]));

    for (const type of DEFAULT_EVENTS) {
      expect(removed.has(type)).toBe(true);
    }
  });

  it("is true straight away for a component that mounts after the interaction", () => {
    const first = renderHook(() => useFirstInteraction());

    interact();
    first.unmount();

    const { result } = renderHook(() => useFirstInteraction());

    expect(result.current).toBe(true);
  });

  it("stays true across a remount", () => {
    const first = renderHook(() => useFirstInteraction());

    interact();

    expect(first.result.current).toBe(true);

    first.unmount();

    const add = vi.spyOn(window, "addEventListener");
    const { result } = renderHook(() => useFirstInteraction());

    expect(result.current).toBe(true);
    /* Nothing is left to wait for, so nothing is listened for. */
    expect(add).not.toHaveBeenCalled();
  });

  it("measures the delay from the interaction, not from the mount", () => {
    const first = renderHook(() => useFirstInteraction());

    interact();
    first.unmount();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const { result } = renderHook(() => useFirstInteraction({ delay: 2500 }));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
  });

  it("shares one interaction between two instances, and one set of listeners", () => {
    const add = vi.spyOn(window, "addEventListener");
    const a = renderHook(() => useFirstInteraction());
    const b = renderHook(() => useFirstInteraction());

    expect(
      add.mock.calls.filter((call) => call[0] === "pointerdown"),
    ).toHaveLength(1);

    interact();

    expect(a.result.current).toBe(true);
    expect(b.result.current).toBe(true);
  });

  it("keeps each instance to its own event list", () => {
    const keys = renderHook(() => useFirstInteraction({ events: ["keydown"] }));
    const all = renderHook(() => useFirstInteraction());

    interact("scroll");

    expect(all.result.current).toBe(true);
    expect(keys.result.current).toBe(false);

    interact("keydown");

    expect(keys.result.current).toBe(true);
  });

  it("keeps listening while another instance is still waiting", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const keys = renderHook(() => useFirstInteraction({ events: ["keydown"] }));

    renderHook(() => useFirstInteraction({ events: ["scroll"] }));

    interact("scroll");

    expect(remove.mock.calls.map((call) => call[0])).toEqual(["scroll"]);

    interact("keydown");

    expect(keys.result.current).toBe(true);
  });

  it("does not lose a pending delay when the options change", () => {
    const { rerender, result } = renderHook(
      ({ delay }) => useFirstInteraction({ delay, timeout: 60_000 }),
      { initialProps: { delay: 2000 } },
    );

    interact();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    rerender({ delay: 3000 });

    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(true);
  });

  it("does not restart the timeout when the options change", () => {
    const { rerender, result } = renderHook(
      ({ delay }) => useFirstInteraction({ delay, timeout: 8000 }),
      { initialProps: { delay: 0 } },
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    rerender({ delay: 500 });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current).toBe(true);
  });

  it("works under StrictMode", () => {
    const remove = vi.spyOn(window, "removeEventListener");
    const { result } = renderHook(() => useFirstInteraction({ delay: 1000 }), {
      wrapper: StrictMode,
    });

    expect(result.current).toBe(false);

    interact();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(true);
    expect(remove.mock.calls.map((call) => call[0])).toContain("pointerdown");
  });
});
