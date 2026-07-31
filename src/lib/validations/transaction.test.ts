import { describe, it, expect } from "vitest";
import { transactionSchema, transactionFiltersSchema } from "@/lib/validations/transaction";

const baseInput = {
  title: "Supermercado",
  amount: 150.5,
  type: "EXPENSE" as const,
  date: new Date("2026-01-15"),
  isRecurring: false,
  isInstallment: false,
};

describe("transactionSchema", () => {
  it("aceita uma transação válida mínima", () => {
    const result = transactionSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("rejeita título muito curto", () => {
    const result = transactionSchema.safeParse({ ...baseInput, title: "A" });
    expect(result.success).toBe(false);
  });

  it("rejeita valor zero ou negativo", () => {
    expect(transactionSchema.safeParse({ ...baseInput, amount: 0 }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...baseInput, amount: -10 }).success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const result = transactionSchema.safeParse({ ...baseInput, type: "TRANSFER" });
    expect(result.success).toBe(false);
  });

  it("aceita categoryId/accountId/cardId vazios (opcionais)", () => {
    const result = transactionSchema.safeParse({ ...baseInput, categoryId: "", accountId: "", cardId: "" });
    expect(result.success).toBe(true);
  });

  it("rejeita categoryId que não é um cuid válido", () => {
    const result = transactionSchema.safeParse({ ...baseInput, categoryId: "not-a-cuid" });
    expect(result.success).toBe(false);
  });

  it("aplica valores padrão para isRecurring/isInstallment quando omitidos", () => {
    const { isRecurring, isInstallment, ...withoutFlags } = baseInput;
    const result = transactionSchema.safeParse(withoutFlags);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRecurring).toBe(false);
      expect(result.data.isInstallment).toBe(false);
    }
  });

  it("converte string numérica de amount via coerce", () => {
    const result = transactionSchema.safeParse({ ...baseInput, amount: "199.90" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(199.9);
  });
});

describe("transactionFiltersSchema", () => {
  it("aplica page=1 e pageSize=25 por padrão", () => {
    const result = transactionFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it("rejeita pageSize acima do limite", () => {
    const result = transactionFiltersSchema.safeParse({ pageSize: 500 });
    expect(result.success).toBe(false);
  });
});
