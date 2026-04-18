"use server";

import { actionClient } from "./lib/safe-action";
import { z } from "zod";

export const testAction = actionClient
  .inputSchema(z.object({
    name: z.string(),
    fail: z.boolean().optional(),
  }))
  .action(async ({ parsedInput }) => {
    if (parsedInput.fail) {
      throw new Error("Intentional error for testing the alert.");
    }
    return { message: "Hello, world!" };
  });
