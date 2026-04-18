'use client';

import type { ReactNode } from 'react';
import { useAction } from "next-safe-action/hooks"
import { testAction } from "@/src/test.action"

function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full rounded-lg border-2 border-red-600 bg-red-50 p-4 text-red-900 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.15)] dark:border-red-500 dark:bg-red-950/60 dark:text-red-50 dark:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.2)]"
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
    <div className="flex flex-col gap-3">
      {isPending && <div>Loading...</div>}
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
      {result?.data && <div>{result.data.message}</div>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => execute({ name: "test" })}
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Test
        </button>
        <button
          type="button"
          onClick={() => execute({ name: "test", fail: true })}
          disabled={isPending}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
        >
          Trigger error
        </button>
      </div>
    </div>
  );
}
