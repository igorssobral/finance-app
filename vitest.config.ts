import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
      DIRECT_URL: "postgresql://test:test@localhost:5432/test_db",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/services/**"],
      exclude: ["src/lib/repositories/**"], // dependem do Prisma/banco — cobertos por testes de integração futuros
    },
  },
});
