"use client";

import { useAction } from "next-safe-action/hooks";
import { enqueueTaskAction } from "@/src/queue.action";

export default function QueueTaskButton() {
  const { execute, result, isPending } = useAction(enqueueTaskAction);

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-zinc-800 dark:bg-zinc-950/40">
      <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Cloudflare Queue
      </p>
      <button
        type="button"
        onClick={() => execute({})}
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white cursor-pointer"
      >
        {isPending ? "Sending…" : "Send task to queue"}
      </button>
      {result?.data?.ok === true && (
        <p
          className="rounded-xl border border-emerald-500/20 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-300"
          role="status"
        >
          Task sent to the queue.
        </p>
      )}
      {result?.serverError != null && result.serverError !== "" && (
        <p
          className="rounded-xl border border-red-500/20 bg-red-50/90 px-3 py-2 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {String(result.serverError)}
        </p>
      )}
    </div>
  );
}
