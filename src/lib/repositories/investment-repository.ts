import { prisma } from "@/lib/prisma";
import type { InvestmentInput } from "@/lib/validations/investment";
import { INVESTMENT_TYPES } from "@/lib/validations/investment";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function findInvestments(userId: string) {
  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: { purchaseDate: "desc" },
  });

  return investments.map((i) => ({
    ...i,
    investedAmount: toNumber(i.investedAmount),
    currentAmount: toNumber(i.currentAmount),
    quantity: i.quantity ? toNumber(i.quantity) : null,
    profit: toNumber(i.currentAmount) - toNumber(i.investedAmount),
  }));
}

export async function createInvestment(userId: string, data: InvestmentInput) {
  return prisma.investment.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      investedAmount: data.investedAmount,
      currentAmount: data.currentAmount,
      quantity: data.quantity ?? null,
      broker: data.broker || null,
      purchaseDate: data.purchaseDate,
    },
  });
}

export async function updateInvestment(userId: string, id: string, data: InvestmentInput) {
  return prisma.investment.update({
    where: { id, userId },
    data: {
      name: data.name,
      type: data.type,
      investedAmount: data.investedAmount,
      currentAmount: data.currentAmount,
      quantity: data.quantity ?? null,
      broker: data.broker || null,
      purchaseDate: data.purchaseDate,
    },
  });
}

export async function deleteInvestment(userId: string, id: string) {
  return prisma.investment.delete({ where: { id, userId } });
}

export async function findInvestmentById(userId: string, id: string) {
  const investment = await prisma.investment.findUnique({ where: { id, userId } });
  if (!investment) return null;
  return {
    ...investment,
    investedAmount: toNumber(investment.investedAmount),
    currentAmount: toNumber(investment.currentAmount),
    quantity: investment.quantity ? toNumber(investment.quantity) : null,
  };
}

/** Resumo do patrimônio: total investido, valor atual, lucro/prejuízo e distribuição por tipo. */
export async function getInvestmentDashboard(userId: string) {
  const investments = await findInvestments(userId);

  const invested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const current = investments.reduce((sum, i) => sum + i.currentAmount, 0);
  const profit = current - invested;
  const profitPercent = invested > 0 ? Number(((profit / invested) * 100).toFixed(2)) : 0;

  const distributionMap = new Map<string, number>();
  for (const i of investments) {
    distributionMap.set(i.type, (distributionMap.get(i.type) ?? 0) + i.currentAmount);
  }

  const distribution = INVESTMENT_TYPES.filter((t) => distributionMap.has(t.value)).map((t) => ({
    type: t.value,
    label: t.label,
    value: distributionMap.get(t.value) ?? 0,
  }));

  return { invested, current, profit, profitPercent, distribution, investments };
}
