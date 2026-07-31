import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/** Saldo atual = saldo inicial das contas + receitas - despesas (todo o histórico). */
export async function getCurrentBalance(userId: string) {
  const [accounts, totals] = await Promise.all([
    prisma.account.aggregate({
      where: { userId, archived: false },
      _sum: { initialBalance: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  const income = toNumber(totals.find((t) => t.type === "INCOME")?._sum.amount);
  const expense = toNumber(totals.find((t) => t.type === "EXPENSE")?._sum.amount);

  return toNumber(accounts._sum.initialBalance) + income - expense;
}

/** Valor total investido e seu rendimento (lucro/prejuízo acumulado). */
export async function getInvestmentSummary(userId: string) {
  const investments = await prisma.investment.findMany({
    where: { userId },
    select: { investedAmount: true, currentAmount: true },
  });

  const invested = investments.reduce((sum, i) => sum + toNumber(i.investedAmount), 0);
  const current = investments.reduce((sum, i) => sum + toNumber(i.currentAmount), 0);

  return { invested, current, profit: current - invested };
}

/** Investido no mês atual vs. anterior (novos aportes), para o card comparativo. */
export async function getInvestedThisMonthVsPrevious(userId: string, reference = new Date()) {
  const [current, previous] = await Promise.all([
    prisma.investment.aggregate({
      where: {
        userId,
        purchaseDate: { gte: startOfMonth(reference), lte: endOfMonth(reference) },
      },
      _sum: { investedAmount: true },
    }),
    prisma.investment.aggregate({
      where: {
        userId,
        purchaseDate: {
          gte: startOfMonth(subMonths(reference, 1)),
          lte: endOfMonth(subMonths(reference, 1)),
        },
      },
      _sum: { investedAmount: true },
    }),
  ]);

  return {
    current: toNumber(current._sum.investedAmount),
    previous: toNumber(previous._sum.investedAmount),
  };
}

/** Fatura aberta (soma de transações no cartão desde o último fechamento). */
export async function getOpenCardInvoiceTotal(userId: string) {
  const cards = await prisma.card.findMany({
    where: { userId, archived: false },
    select: { id: true, name: true, limit: true, closingDay: true, color: true },
  });

  const now = new Date();
  const results = await Promise.all(
    cards.map(async (card) => {
      const closingThisMonth = new Date(now.getFullYear(), now.getMonth(), card.closingDay);
      const periodStart =
        now.getDate() > card.closingDay
          ? closingThisMonth
          : new Date(now.getFullYear(), now.getMonth() - 1, card.closingDay);

      const total = await prisma.transaction.aggregate({
        where: { cardId: card.id, date: { gte: periodStart, lte: now } },
        _sum: { amount: true },
      });

      return {
        cardId: card.id,
        name: card.name,
        color: card.color,
        limit: toNumber(card.limit),
        invoiceTotal: toNumber(total._sum.amount),
      };
    }),
  );

  return {
    total: results.reduce((sum, r) => sum + r.invoiceTotal, 0),
    cards: results,
  };
}

/** Progresso agregado das metas em andamento (para o card "Meta mensal"). */
export async function getGoalsProgress(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId, status: "IN_PROGRESS" },
    select: { targetAmount: true, currentAmount: true },
  });

  const target = goals.reduce((sum, g) => sum + toNumber(g.targetAmount), 0);
  const current = goals.reduce((sum, g) => sum + toNumber(g.currentAmount), 0);

  return {
    target,
    current,
    percent: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
  };
}
