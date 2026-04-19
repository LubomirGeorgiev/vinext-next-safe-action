/**
 * Durable Object WebSocket chat room (hibernation API), used by `/chat` via `/_worker/chat`.
 * Message history is stored in DO storage so new clients receive prior messages for the room.
 * @see https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
 */
import { DurableObject } from "cloudflare:workers";

type SessionAttachment = { id: string };

type ChatEntry = { from: string; text: string };

const CHAT_HISTORY_KEY = "chat_history";
const MAX_HISTORY = 500;

export class WebSocketChat extends DurableObject {
  private sessions: Map<WebSocket, SessionAttachment>;
  private history: ChatEntry[];
  private historyLoaded: boolean;
  private historyLoadPromise: Promise<void> | null;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sessions = new Map();
    this.history = [];
    this.historyLoaded = false;
    this.historyLoadPromise = null;

    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment() as SessionAttachment | null;
      if (attachment) {
        this.sessions.set(ws, attachment);
      }
    });

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }

  private async ensureHistoryLoaded(): Promise<void> {
    if (this.historyLoaded) return;
    if (!this.historyLoadPromise) {
      this.historyLoadPromise = (async () => {
        const stored = await this.ctx.storage.get<string>(CHAT_HISTORY_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as unknown;
            if (Array.isArray(parsed)) {
              this.history = parsed.filter(
                (row): row is ChatEntry =>
                  typeof row === "object" &&
                  row !== null &&
                  typeof (row as ChatEntry).from === "string" &&
                  typeof (row as ChatEntry).text === "string",
              );
            }
          } catch {
            this.history = [];
          }
        }
        this.historyLoaded = true;
      })();
    }
    await this.historyLoadPromise;
  }

  private async appendHistory(from: string, text: string): Promise<void> {
    await this.ensureHistoryLoaded();
    this.history.push({ from, text });
    if (this.history.length > MAX_HISTORY) {
      this.history = this.history.slice(-MAX_HISTORY);
    }
    await this.ctx.storage.put(CHAT_HISTORY_KEY, JSON.stringify(this.history));
  }

  async fetch(request: Request): Promise<Response> {
    void request;
    await this.ensureHistoryLoaded();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    const id = crypto.randomUUID();
    server.serializeAttachment({ id });
    this.sessions.set(server, { id });

    server.send(
      JSON.stringify({
        type: "welcome",
        sessionId: id,
        clients: this.sessions.size,
      }),
    );

    server.send(
      JSON.stringify({
        type: "history",
        messages: this.history.map((m) => ({ from: m.from, text: m.text })),
        clients: this.sessions.size,
      }),
    );

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    const session = this.sessions.get(ws);
    if (!session) return;

    const text =
      typeof message === "string"
        ? message
        : new TextDecoder().decode(message);

    await this.appendHistory(session.id, text);

    const payload = JSON.stringify({
      type: "broadcast",
      from: session.id,
      text,
      clients: this.sessions.size,
    });

    for (const sock of this.sessions.keys()) {
      sock.send(payload);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    void wasClean;
    ws.close(code, reason);
    this.sessions.delete(ws);
  }
}
