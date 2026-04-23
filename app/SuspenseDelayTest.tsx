/** Async server component: delays then resolves to verify Suspense fallback → content. */

export type SuspenseDelayTestProps = {
  delayMs: number;
};

export default async function SuspenseDelayTest({ delayMs }: SuspenseDelayTestProps) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

  return (
    <p className="rounded-2xl border border-green-500/25 bg-green-50/90 px-4 py-3 text-sm text-green-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-green-400/25 dark:bg-green-950/30 dark:text-green-100">
      Suspense test resolved after {delayMs}ms.
    </p>
  );
}
