import { PrismaClient } from "@prisma/client";

declare global {
  // Reuse the Prisma client during local development hot reloads.
  var __niarPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__niarPrisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__niarPrisma__ = prisma;
}

export * from "@prisma/client";
