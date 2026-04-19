import Link from "next/link";
import type { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "Chat demo",
  description: "Durable Object WebSocket chat room on Cloudflare Workers",
};

export default function ChatPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_34%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_52%,_#ecfdf5_100%)] px-6 py-12 font-sans dark:bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#111827_55%,_#052e16_100%)] sm:px-10 sm:py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <div className="absolute left-1/2 top-1/3 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-300/10" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-emerald-800 underline decoration-emerald-500/40 underline-offset-4 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Home
          </Link>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Chat demo
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Real-time messages through a Durable Object (
            <code className="rounded bg-zinc-500/10 px-1.5 py-0.5 font-mono text-[0.8rem]">
              WebSocketChat
            </code>
            , room{" "}
            <code className="rounded bg-zinc-500/10 px-1.5 py-0.5 font-mono text-[0.8rem]">
              chat-room
            </code>
            ). Recent messages are replayed when you join; open another tab to see live updates.
          </p>
        </header>

        <section className="rounded-[1.5rem] border border-black/5 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/25">
          <ChatClient />
        </section>
      </div>
    </main>
  );
}
