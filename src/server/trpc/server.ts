import "server-only";
import { createTRPCContext } from "./procedure";
import { createQueryClient } from "./shared";
import { AppRouter, createCaller } from "../api/root";
import { authOptions } from "../auth/auth";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { cache } from "react";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient);

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const readOnlyHeaders = await headers();
  const heads = new Headers(readOnlyHeaders);
  heads.set("x-trpc-source", "rsc");

  const session = await getServerSession(authOptions);

  return createTRPCContext({
    headers: heads,
    session,
  });
});

const caller = createCaller(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
