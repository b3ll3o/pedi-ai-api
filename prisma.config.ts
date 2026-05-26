import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://admin:admin@187.77.204.108:5432/e2e_api?schema=public",
  },
  migrations: {
    path: "prisma/migrations",
  },
});
