import { describe, it, expect } from "vitest";
import { buildWhere } from "@/lib/repositories/transaction-crud-repository";
import { transactionFiltersSchema } from "@/lib/validations/transaction";

const userId = "user_123";

describe("buildWhere", () => {
  it("sempre inclui o userId, mesmo sem filtros", () => {
    const where = buildWhere(userId, transactionFiltersSchema.parse({}));
    expect(where.userId).toBe(userId);
  });

  it("adiciona busca por título/descrição em OR quando 'search' é informado", () => {
    const where = buildWhere(userId, transactionFiltersSchema.parse({ search: "mercado" }));
    expect(where.OR).toBeDefined();
    expect(where.OR).toHaveLength(2);
  });

  it("não inclui OR quando não há busca", () => {
    const where = buildWhere(userId, transactionFiltersSchema.parse({}));
    expect(where.OR).toBeUndefined();
  });

  it("aplica filtro de tipo, categoria, conta e cartão quando informados", () => {
    const where = buildWhere(
      userId,
      transactionFiltersSchema.parse({
        type: "EXPENSE",
        categoryId: "cat_1",
        accountId: "acc_1",
        cardId: "card_1",
      }),
    );
    expect(where.type).toBe("EXPENSE");
    expect(where.categoryId).toBe("cat_1");
    expect(where.accountId).toBe("acc_1");
    expect(where.cardId).toBe("card_1");
  });

  it("aplica filtro de recorrentes/parceladas apenas quando true", () => {
    const where = buildWhere(userId, transactionFiltersSchema.parse({ onlyRecurring: true }));
    expect(where.isRecurring).toBe(true);
    expect(where.isInstallment).toBeUndefined();
  });

  it("combina dateFrom e dateTo em um único filtro de intervalo", () => {
    const dateFrom = new Date("2026-01-01");
    const dateTo = new Date("2026-01-31");
    const where = buildWhere(userId, transactionFiltersSchema.parse({ dateFrom, dateTo }));
    expect(where.date).toEqual({ gte: dateFrom, lte: dateTo });
  });

  it("combina minAmount e maxAmount em um único filtro de intervalo", () => {
    const where = buildWhere(userId, transactionFiltersSchema.parse({ minAmount: 10, maxAmount: 100 }));
    expect(where.amount).toEqual({ gte: 10, lte: 100 });
  });
});
