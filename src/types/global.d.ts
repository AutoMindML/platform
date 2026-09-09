import { createPrismaClient } from "@/server/db";

export {};

declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}
