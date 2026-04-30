// export the PRISMA Client
// we are creating a database client that your app can use to talk to PostgreSQL—but with a custom driver instead of Prisma's default one.
import { PrismaClient } from "./generated/prisma/client";
import {PrismaPg}   from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter=new PrismaPg({
    connectionString,
});

export const prisma=new PrismaClient({
    adapter
})