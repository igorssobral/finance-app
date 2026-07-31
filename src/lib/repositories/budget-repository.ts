import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import type { BudgetInput } from "@/lib/validations/budget";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function getPeriodRange(period: "MONTHLY" | "QUARTERLY" | "YEARLY", reference = new Date()) {
  switch (period) {
    case "QUARTERLY":
      return { start: startOfQuarter(reference), end: endOfQuarter(reference) };
    case "YEARLY":
      return { start: startOfYear(reference), end: endOfYear(reference) };
    default:
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
  }
}

export async function findBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, color: true, icon: true } } },
  });

  const withSpending = await Promise.all(
    budgets.map(async (budget) => {
      const { start, end } = getPeriodRange(budget.period, new Date());
      const spent = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const limit = toNumber(budget.limit);
      const spentTotal = toNumber(spent._sum.amount);
      const percent = limit > 0 ? Math.round((spentTotal / limit) * 100) : 0;

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        category: budget.category,
        limit,
        period: budget.period,
        alertAt: budget.alertAt,
        spent: spentTotal,
        percent,
        isOverLimit: percent >= 100,
        isNearLimit: percent >= budget.alertAt && percent < 100,
      };
    }),
  );

  return withSpending;
}

export async function createBudget(userId: string, data: BudgetInput) {
  return prisma.budget.create({
    data: {
      userId,
      categoryId: data.categoryId,
      limit: data.limit,
      period: data.period,
      alertAt: data.alertAt,
    },
  });
}

export async function updateBudget(userId: string, id: string, data: BudgetInput) {
  return prisma.budget.update({
    where: { id, userId },
    data: {
      categoryId: data.categoryId,
      limit: data.limit,
      period: data.period,
      alertAt: data.alertAt,
    },
  });
}

export async function deleteBudget(userId: string, id: string) {
  return prisma.budget.delete({ where: { id, userId } });
}

export async function findBudgetById(userId: string, id: string) {
  return prisma.budget.findUnique({ where: { id, userId } });
}
