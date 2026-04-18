"use client";

import type { ReactNode } from "react";
import { useAction } from "next-safe-action/hooks";
import { testAction } from "@/src/test.action";

function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full rounded-2xl border border-red-500/30 bg-red-50/90 p-4 text-red-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-50"
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-red-600 dark:text-red-400" aria-hidden>
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </span>
        <p className="text-xs font-bold uppercase tracking-widest text-red-800 dark:text-red-200">
          Alert
        </p>
      </div>
      <div className="mt-2 min-w-0 text-sm font-medium">{children}</div>
    </div>
  );
}

export default function Test() {
  const { execute, result, isPending } = useAction(testAction);

  return (
    <div className="flex flex-col gap-4">
      {isPending && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-800 dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-100">
          Running test action...
        </div>
      )}
      {result?.serverError != null && result.serverError !== "" && (
        <Alert>{String(result.serverError)}</Alert>
      )}
      {result?.validationErrors != null && (
        <Alert>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed">
            {JSON.stringify(result.validationErrors?._errors?.[0], null, 2)}
          </pre>
        </Alert>
      )}
      {result?.data && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-500/20 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {result.data.message}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => execute({ name: "test" })}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Test
        </button>
        <button
          type="button"
          onClick={() => execute({ name: "test", fail: true })}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Trigger error
        </button>
      </div>
    </div>
  );
}
