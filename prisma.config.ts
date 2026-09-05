import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Configura el esquema, directorio de migraciones y comando de ejecucion del seed con tsx
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
