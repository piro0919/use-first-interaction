import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOnFirstInteraction } from "../src/useOnFirstInteraction";

function interact(): void {
  act(() => {
    window.dispatchEvent(new Event("pointerdown"));
  });
}

describe("useOnFirstInteraction", () => {
  it("does not run before anything happens", () => {
    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it("runs on the first interaction", () => {
    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback));

    interact();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs once, however many events arrive", () => {
    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback));

    interact();
    interact();
    interact();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not run again when the caller passes a new function each render", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(() =>
      useOnFirstInteraction(() => callback()),
    );

    interact();
    rerender();
    rerender();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("reports the interaction to the caller as well", () => {
    const { result } = renderHook(() => useOnFirstInteraction(() => undefined));

    interact();

    expect(result.current).toBe(true);
  });

  it("reports a callback that rejects instead of leaving an unhandled rejection", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() =>
      useOnFirstInteraction(() => Promise.reject(new Error("nope"))),
    );

    interact();
    await act(async () => undefined);

    expect(result.current).toBe(true);
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });

  it("reports a callback that throws, and does not take the page down with it", () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => {
      renderHook(() =>
        useOnFirstInteraction(() => {
          throw new Error("nope");
        }),
      );

      interact();
    }).not.toThrow();
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });
});
