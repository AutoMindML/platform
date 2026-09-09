import {
    defaultShouldDehydrateQuery,
    QueryClient,
} from "@tanstack/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson, { deserialize, serialize } from "superjson";

import { env } from "@/env.mjs";
import { type AppRouter } from "@/server/api/root";

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (env.VERCEL_URL) return `${env.VERCEL_URL}`;
  return env.BASE_URL;
}

export function getTrpcUrl() {
  return getBaseUrl() + "/api/trpc";
}

// for react server components
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: deserialize,
      },
    },
  });
}

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
