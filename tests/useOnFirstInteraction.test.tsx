import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
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

  it("runs once under StrictMode", () => {
    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback), { wrapper: StrictMode });

    interact();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs once under StrictMode when the interaction came before the mount", () => {
    const callback = vi.fn();

    const first = renderHook(() => useOnFirstInteraction(() => undefined));

    interact();
    first.unmount();

    renderHook(() => useOnFirstInteraction(callback), { wrapper: StrictMode });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs straight away in a component that mounts after the interaction", () => {
    const first = renderHook(() => useOnFirstInteraction(() => undefined));

    interact();
    first.unmount();

    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs again after a remount when it has no id", () => {
    const callback = vi.fn();
    const first = renderHook(() => useOnFirstInteraction(callback));

    interact();
    first.unmount();
    renderHook(() => useOnFirstInteraction(callback));

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("runs once per page under an id, however often it mounts", () => {
    const callback = vi.fn();
    const first = renderHook(() =>
      useOnFirstInteraction(() => callback(), { id: "hotjar" }),
    );

    interact();
    first.unmount();

    const second = renderHook(() =>
      useOnFirstInteraction(() => callback(), { id: "hotjar" }),
    );

    expect(second.result.current).toBe(true);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs once between two mounted components sharing an id", () => {
    const callback = vi.fn();

    renderHook(() => useOnFirstInteraction(callback, { id: "chat" }));
    renderHook(() => useOnFirstInteraction(callback, { id: "chat" }));

    interact();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("runs each id once", () => {
    const a = vi.fn();
    const b = vi.fn();

    renderHook(() => useOnFirstInteraction(a, { id: "a" }));
    renderHook(() => useOnFirstInteraction(b, { id: "b" }));

    interact();

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
