"use server";

import { env } from "cloudflare:workers";
import { z } from "zod";
import { actionClient } from "./lib/safe-action";

export const enqueueTaskAction = actionClient
  .inputSchema(z.object({}))
  .action(async () => {
    await env.APP_QUEUE.send({
      source: "app",
      at: new Date().toISOString(),
      task: "ui-demo",
    });
    return { ok: true as const };
  });
