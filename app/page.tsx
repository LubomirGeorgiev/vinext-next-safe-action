import Image from "next/image";
import { Suspense } from "react";
import QueueTaskButton from "./QueueTaskButton";
import SuspenseDelayTest from "./SuspenseDelayTest";
import Test from "./Test";

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_34%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#ecfdf5_100%)] px-6 py-20 font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111827_55%,_#052e16_100%)] sm:px-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <div className="absolute left-1/2 top-1/2 -z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-300/10" />
      <div className="absolute right-0 top-16 -z-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-300/10" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium tracking-wide text-emerald-950 dark:border-emerald-300/15 dark:bg-emerald-300/10 dark:text-emerald-100">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <span className="hidden text-emerald-900/70 dark:text-emerald-100/70 sm:inline">
            App Router starter
          </span>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-black/5 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/20">
            <div className="mb-4">
              <p className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                Async rendering tests
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Check Suspense fallback timing and queue integration in one
                place.
              </p>
            </div>

            <div className="space-y-4">
              <Suspense
                fallback={
                  <p
                    className="w-full rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 animate-pulse dark:border-amber-400/30 dark:bg-amber-950/30 dark:text-amber-100"
                    role="status"
                    aria-live="polite"
                  >
                    Suspense fallback: waiting for delayed promise (2s)...
                  </p>
                }
              >
                <SuspenseDelayTest />
              </Suspense>

              <QueueTaskButton />
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-black/5 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Safe action tests
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Trigger success and failure states for the server action.
                </p>
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
                Interactive
              </span>
            </div>
            <Test />
          </section>
        </div>
      </div>
    </main>
  );
}
