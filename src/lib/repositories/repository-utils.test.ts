import { describe, it, expect } from "vitest";
import { withDbFallback } from "@/lib/repositories/repository-utils";

describe("withDbFallback", () => {
  it("retorna o fallback para erros de conexão com o banco", async () => {
    const result = await withDbFallback(
      async () => {
        throw new Error("Can't reach database server at localhost");
      },
      { ok: false },
    );

    expect(result).toEqual({ ok: false });
  });

  it("retorna o resultado da operação quando ela funciona", async () => {
    const result = await withDbFallback(async () => ({ ok: true }), { ok: false });

    expect(result).toEqual({ ok: true });
  });
});
