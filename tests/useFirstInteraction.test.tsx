import { act, renderHook } from "@testing-library/react";
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
});
