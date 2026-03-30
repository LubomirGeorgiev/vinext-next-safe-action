"use server";

import { actionClient } from "./lib/safe-action";

export const testAction = actionClient
  .action(async () => {
    return { message: "Hello, world!" };
  });
