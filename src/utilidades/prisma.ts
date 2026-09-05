import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/client/client.js";

// Instancia el cliente de Prisma utilizando el adaptador PrismaPg para conexion con PostgreSQL
const adaptador = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

export const prisma = new PrismaClient({ adapter: adaptador });
