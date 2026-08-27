"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOnFirstInteraction } from "@/useOnFirstInteraction";

type Loaded = {
  /** Milliseconds from the interaction to the module being ready. */
  duration: number;
  name: string;
  /** Milliseconds from arriving to the interaction. */
  waited: number;
};

const DELAYS = [0, 1000, 2500];

function ms(value: number): string {
  return `${(value / 1000).toFixed(1)} s`;
}

/**
 * The demo is not a picture of a waterfall. The chunk below is a real dynamic
 * import that has not been fetched yet, and the numbers are `performance.now()`
 * either side of the interaction that fetches it.
 *
 * Everything that watches for the interaction lives in `Probe`, so arming it
 * again is a remount rather than a pile of state to put back.
 */
function Probe({ delay }: { delay: number }) {
  const [loaded, setLoaded] = useState<null | Loaded>(null);
  const [elapsed, setElapsed] = useState(0);
  const mounted = useRef(performance.now());

  useEffect(() => {
    if (loaded !== null) return;

    const timer = setInterval(
      () => setElapsed(performance.now() - mounted.current),
      100,
    );

    return () => clearInterval(timer);
  }, [loaded]);

  const load = useCallback(async () => {
    const startedFetching = performance.now();
    const { PAYLOAD } = await import("./deferred-payload");

    setLoaded({
      duration: performance.now() - startedFetching,
      name: PAYLOAD.name,
      waited: startedFetching - mounted.current - delay,
    });
  }, [delay]);

  const interacted = useOnFirstInteraction(load, { delay });

  if (loaded === null) {
    return (
      <div>
        <p className="font-display text-2xl font-bold text-white">
          Nothing has been fetched.
        </p>
        <p className="mt-3 font-mono text-sm text-zinc-500">
          {ms(elapsed)} on this page —{" "}
          {interacted ? "waiting out the delay" : "no interaction yet"}.
        </p>
        <p className="mt-4 text-sm text-zinc-400">
          Click, scroll, or press a key. Reading counts: a scroll is an
          interaction, and that is the point — someone who leaves without one
          was never going to see the widget.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-display text-2xl font-bold text-rose-300">
        {loaded.name} is here.
      </p>
      <dl className="mt-5 grid gap-x-8 gap-y-3 font-mono text-sm sm:grid-cols-2">
        {[
          ["first interaction", ms(loaded.waited)],
          ["delay waited out", `${delay} ms`],
          ["chunk fetched in", `${loaded.duration.toFixed(0)} ms`],
          ["fetched before that", "nothing"],
        ].map(([label, value]) => (
          <div
            className="flex justify-between gap-4 border-b border-white/5 pb-2"
            key={label}
          >
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm text-zinc-400">
        Until that moment the chunk was not in the page at all. On a visit that
        ends before the first interaction, it never is.
      </p>
    </div>
  );
}

export default function DeferredDemo() {
  const [delay, setDelay] = useState(0);
  const [armed, setArmed] = useState(0);
  const rearm = useCallback(() => setArmed((count) => count + 1), []);

  return (
    <div className="rounded-2xl border border-rose-900/40 bg-[#150f11]">
      <div className="flex flex-wrap items-center gap-3 border-b border-rose-900/40 px-5 py-3">
        <span className="font-mono text-[11px] tracking-wide text-rose-400/80 uppercase">
          delay
        </span>
        {DELAYS.map((candidate) => (
          <button
            className={`rounded-lg px-3 py-1 font-mono text-sm transition-colors ${
              delay === candidate
                ? "bg-rose-500 text-white"
                : "border border-white/10 text-zinc-400 hover:text-zinc-200"
            }`}
            key={candidate}
            onClick={() => {
              setDelay(candidate);
              rearm();
            }}
            type="button"
          >
            {candidate} ms
          </button>
        ))}
        <button
          className="ml-auto rounded-lg border border-white/10 px-3 py-1 font-mono text-sm text-zinc-400 hover:text-zinc-200"
          onClick={rearm}
          type="button"
        >
          arm it again
        </button>
      </div>

      <div className="px-5 py-8">
        <Probe delay={delay} key={armed} />
      </div>
    </div>
  );
}
