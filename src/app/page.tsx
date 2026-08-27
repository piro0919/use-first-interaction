import DeferredDemo from "./_components/deferred-demo";

const BASIC = `import { useFirstInteraction } from "use-first-interaction";

export default function Analytics() {
  const interacted = useFirstInteraction({ delay: 2500 });

  return interacted ? <Tag /> : null;
}`;

const CALLBACK = `import { useOnFirstInteraction } from "use-first-interaction";

useOnFirstInteraction(async () => {
  const { hotjar } = await import("react-hotjar");

  hotjar.initialize({ id, sv });
}, { delay: 2500 });`;

const OPTIONS = [
  {
    body: "Wait this long after the interaction before reporting it. The interaction itself is the frame the visitor cares most about, and it is the one moment not to spend on a third party.",
    name: "delay",
  },
  {
    body: "keydown, pointerdown, scroll, touchstart, wheel. Scroll is on the list because a reader who only reads never presses anything.",
    name: "events",
  },
  {
    body: "Report the interaction anyway after a while. Off by default: a visitor who leaves without touching anything is exactly the one you did not want to load for.",
    name: "timeout",
  },
  {
    body: "Report nothing at all — for switching the deferred work off in development, where a recorder session per hot reload helps no one.",
    name: "disabled",
  },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#150f11] p-5 font-mono text-[13px] leading-relaxed text-zinc-300">
      <code>{children}</code>
    </pre>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#120c0e] text-zinc-200">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header>
          <p className="font-mono text-xs tracking-[0.2em] text-rose-400/80 uppercase">
            npm i use-first-interaction
          </p>
          <h1 className="font-display mt-4 text-4xl leading-tight font-bold text-white sm:text-5xl">
            Load it when they arrive.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400">
            Analytics, chat widgets and heatmap recorders do not need to be in
            the first paint. They need to be there by the time someone is
            actually using the page — which is a moment the browser can tell you
            about.
          </p>
        </header>

        <section className="mt-12">
          <DeferredDemo />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white">
            Two hooks
          </h2>
          <p className="mt-3 mb-6 text-zinc-400">
            One reports the interaction as a boolean. The other runs something
            once, when it happens.
          </p>
          <Code>{BASIC}</Code>
          <div className="mt-6">
            <Code>{CALLBACK}</Code>
          </div>
          <p className="mt-6 text-zinc-400">
            Both are <code className="font-mono text-rose-300">false</code> on
            the server and on the first client render, so neither changes what
            hydration compares.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white">Options</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {OPTIONS.map((option) => (
              <div
                className="rounded-2xl border border-white/10 bg-[#150f11] p-5"
                key={option.name}
              >
                <h3 className="font-mono text-sm text-rose-300">
                  {option.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {option.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-white">
            What this is not
          </h2>
          <p className="mt-3 text-zinc-400">
            It is not a consent gate. Deferring a tracker changes when it loads,
            not whether you were allowed to load it. It is also not lazy
            rendering: for something that should appear when it scrolls into
            view, an intersection observer is the right instrument.
          </p>
        </section>

        <footer className="mt-20 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-8 font-mono text-sm text-zinc-500">
          <a
            className="hover:text-rose-300"
            href="https://www.npmjs.com/package/use-first-interaction"
          >
            npm
          </a>
          <a
            className="hover:text-rose-300"
            href="https://github.com/piro0919/use-first-interaction"
          >
            GitHub
          </a>
          <a className="hover:text-rose-300" href="https://kkweb.io/">
            kkweb.io
          </a>
          <span className="ml-auto">MIT</span>
        </footer>
      </div>
    </div>
  );
}
