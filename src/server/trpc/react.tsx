"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { ReactNode, useState } from "react";

import { env } from "@/env.mjs";
import { trpc } from "@/server/trpc/client";
import {
  createQueryClient,
  getTrpcUrl,
  transformer,
} from "@/server/trpc/shared";

interface TrpcProviderProps {
  children: ReactNode;
}

let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }

  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
}

export const TrpcProvider = (props: TrpcProviderProps) => {
  // FIXME: miss queryClient when page content changed on dev
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // doc: https://trpc.io/docs/client/links/loggerLink
        loggerLink({
          enabled: (opts) =>
            (env.NEXT_PUBLIC_NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        // migrate to v11: transformers moved to here
        httpBatchLink({
          url: getTrpcUrl(),
          transformer,
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
