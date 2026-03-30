'use client';

import { useAction } from "next-safe-action/hooks"
import { testAction } from "@/src/test.action"

export default function Test() {
  const { execute, result, isPending } = useAction(testAction);

  return <div>
    <button onClick={() => execute()}>Test</button>
    {isPending && <div>Loading...</div>}
    {result && <div>{result.data?.message}</div>}
  </div>;
}
