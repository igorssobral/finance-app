import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password", () => {
  it("gera um hash diferente da senha original", async () => {
    const hash = await hashPassword("MinhaSenh@123");
    expect(hash).not.toBe("MinhaSenh@123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifica corretamente a senha certa", async () => {
    const hash = await hashPassword("MinhaSenh@123");
    expect(await verifyPassword("MinhaSenh@123", hash)).toBe(true);
  });

  it("rejeita uma senha errada", async () => {
    const hash = await hashPassword("MinhaSenh@123");
    expect(await verifyPassword("SenhaErrada", hash)).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const hash1 = await hashPassword("MesmaSenha1");
    const hash2 = await hashPassword("MesmaSenha1");
    expect(hash1).not.toBe(hash2);
  });
});
