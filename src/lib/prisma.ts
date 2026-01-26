import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbSeeded: boolean | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Flag pour savoir si on a déjà seedé
export function markAsSeeded() {
  globalForPrisma.dbSeeded = true;
}

export function isSeeded() {
  return globalForPrisma.dbSeeded === true;
}

export default prisma;
