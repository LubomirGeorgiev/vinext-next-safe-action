"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Must match `CHAT_WS_PATH` in `worker/custom-entry.ts`. */
const CHAT_WS_PATH = "/_worker/chat";

function chatWsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}${CHAT_WS_PATH}`;
}

function peerLabel(sessionId: string): string {
  return `Guest · ${sessionId.replace(/-/g, "").slice(0, 8)}`;
}

type ServerPayload =
  | { type: "welcome"; sessionId: string; clients: number }
  | {
      type: "history";
      messages: { from: string; text: string }[];
      clients: number;
    }
  | { type: "broadcast"; from: string; text: string; clients: number };

function parseServerMessage(raw: string): ServerPayload | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null) return null;
    const o = data as Record<string, unknown>;
    if (o.type === "welcome") {
      if (typeof o.sessionId !== "string" || typeof o.clients !== "number") {
        return null;
      }
      return { type: "welcome", sessionId: o.sessionId, clients: o.clients };
    }
    if (o.type === "history") {
      if (typeof o.clients !== "number" || !Array.isArray(o.messages)) {
        return null;
      }
      const messages: { from: string; text: string }[] = [];
      for (const row of o.messages) {
        if (
          typeof row !== "object" ||
          row === null ||
          typeof (row as { from?: unknown }).from !== "string" ||
          typeof (row as { text?: unknown }).text !== "string"
        ) {
          return null;
        }
        messages.push({
          from: (row as { from: string }).from,
          text: (row as { text: string }).text,
        });
      }
      return { type: "history", messages, clients: o.clients };
    }
    if (o.type === "broadcast") {
      if (
        typeof o.from !== "string" ||
        typeof o.text !== "string" ||
        typeof o.clients !== "number"
      ) {
        return null;
      }
      return { type: "broadcast", from: o.from, text: o.text, clients: o.clients };
    }
    return null;
  } catch {
    return null;
  }
}

type Line =
  | { id: string; kind: "system"; text: string }
  | {
      id: string;
      kind: "message";
      text: string;
      isSelf: boolean;
      label: string;
    };

export default function ChatClient() {
  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">(
    "connecting",
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const appendLine = useCallback((line: Line) => {
    setLines((prev) => [...prev.slice(-200), line]);
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("closed");
  }, []);

  const connect = useCallback(() => {
    disconnect();
    sessionIdRef.current = null;
    setStatus("connecting");
    setSessionId(null);
    setClientCount(null);
    setLines([]);

    const ws = new WebSocket(chatWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
    };

    ws.onmessage = (ev) => {
      const raw = typeof ev.data === "string" ? ev.data : "";
      const msg = parseServerMessage(raw);
      if (!msg) {
        appendLine({
          id: crypto.randomUUID(),
          kind: "system",
          text: raw ? `[unparsed] ${raw.slice(0, 200)}` : "[empty message]",
        });
        return;
      }
      if (msg.type === "welcome") {
        sessionIdRef.current = msg.sessionId;
        setSessionId(msg.sessionId);
        setClientCount(msg.clients);
        appendLine({
          id: crypto.randomUUID(),
          kind: "system",
          text: `Connected · ${msg.clients} online`,
        });
        return;
      }
      if (msg.type === "history") {
        setClientCount(msg.clients);
        const sid = sessionIdRef.current;
        for (let i = 0; i < msg.messages.length; i++) {
          const m = msg.messages[i];
          const isSelf = sid !== null && m.from === sid;
          appendLine({
            id: `history-${i}-${m.from}`,
            kind: "message",
            text: m.text,
            isSelf,
            label: isSelf ? "You" : peerLabel(m.from),
          });
        }
        return;
      }
      setClientCount(msg.clients);
      const sid = sessionIdRef.current;
      const isSelf = sid !== null && msg.from === sid;
      appendLine({
        id: crypto.randomUUID(),
        kind: "message",
        text: msg.text,
        isSelf,
        label: isSelf ? "You" : peerLabel(msg.from),
      });
    };

    ws.onerror = () => {
      setStatus("error");
      appendLine({
        id: crypto.randomUUID(),
        kind: "system",
        text: "Connection error.",
      });
    };

    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      setStatus((s) => (s === "open" || s === "connecting" ? "closed" : s));
      appendLine({
        id: crypto.randomUUID(),
        kind: "system",
        text: "Disconnected.",
      });
    };
  }, [appendLine, disconnect]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      connect();
    }, 0);
    return () => {
      window.clearTimeout(id);
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  const send = () => {
    const w = wsRef.current;
    if (!w || w.readyState !== WebSocket.OPEN) return;
    const t = input.trim();
    if (!t) return;
    w.send(t);
    setInput("");
  };

  return (
    <div className="flex min-h-[min(70vh,560px)] flex-col gap-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Same pattern as Cloudflare&apos;s{" "}
        <a
          className="text-emerald-700 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
          href="https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/"
          target="_blank"
          rel="noreferrer"
        >
          WebSocket hibernation
        </a>{" "}
        example: one Durable Object per room (
        <code className="rounded bg-zinc-500/10 px-1 py-0.5 font-mono text-[0.8rem]">
          chat-room
        </code>
        ). History is stored in the DO so new joiners see recent messages.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={connect}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
        >
          Reconnect
        </button>
        <span
          className="inline-flex items-center rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300"
          title={sessionId ? `Session ${sessionId}` : undefined}
        >
          {status}
        </span>
        {clientCount !== null && (
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {clientCount} connected
          </span>
        )}
      </div>

      <div
        ref={listRef}
        className="min-h-[240px] flex-1 overflow-y-auto rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-inner dark:border-zinc-700/80 dark:bg-zinc-950/80"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <ul className="flex flex-col gap-3">
          {lines.length === 0 && (
            <li className="text-sm text-zinc-500 dark:text-zinc-400">
              Waiting for messages…
            </li>
          )}
          {lines.map((line) =>
            line.kind === "system" ? (
              <li
                key={line.id}
                className="text-center text-xs text-zinc-500 dark:text-zinc-500"
              >
                {line.text}
              </li>
            ) : (
              <li
                key={line.id}
                className={`flex flex-col gap-0.5 ${line.isSelf ? "items-end" : "items-start"}`}
              >
                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  {line.label}
                </span>
                <span
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    line.isSelf
                      ? "bg-emerald-600 text-white dark:bg-emerald-700"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {line.text}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="Message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={status !== "open"}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={send}
          disabled={status !== "open"}
          className="shrink-0 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
