import { PrismaClient } from "@prisma/client";

import { env } from "@/env.mjs";

export const createPrismaClient = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NEXT_PUBLIC_NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

export const prismaAdmin = globalThis.prisma ?? createPrismaClient();

if (env.NEXT_PUBLIC_NODE_ENV !== "production") {
  globalThis.prisma = prismaAdmin;
}
