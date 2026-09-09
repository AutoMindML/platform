import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { getServerAuthSession } from "@/server/auth/auth";
import { createTRPCContext } from "@/server/trpc/procedure";

const createContext = async (req: NextRequest) => {
  const session = await getServerAuthSession();

  return createTRPCContext({
    headers: req.headers,
    session,
  });
};

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: env.NEXT_PUBLIC_NODE_ENV === "development"
      ? ({ path, error }) => {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
        );
      }
      : undefined,
  });
};

export { handler as GET, handler as POST };
