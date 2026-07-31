import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from "date-fns";

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/** Soma de receitas e despesas de um usuário dentro de um intervalo de datas. */
export async function getTotalsByPeriod(userId: string, start: Date, end: Date) {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  return {
    income: toNumber(income._sum.amount),
    expense: toNumber(expense._sum.amount),
  };
}

/** Totais do mês atual e do mês anterior, para calcular variação percentual. */
export async function getCurrentAndPreviousMonthTotals(userId: string, reference = new Date()) {
  const currentStart = startOfMonth(reference);
  const currentEnd = endOfMonth(reference);
  const previousStart = startOfMonth(subMonths(reference, 1));
  const previousEnd = endOfMonth(subMonths(reference, 1));

  const [current, previous] = await Promise.all([
    getTotalsByPeriod(userId, currentStart, currentEnd),
    getTotalsByPeriod(userId, previousStart, previousEnd),
  ]);

  return { current, previous };
}

/** Receitas x Despesas e fluxo de caixa dos últimos N meses (para gráficos de barra/linha). */
export async function getLastNMonthsTotals(userId: string, months = 12, reference = new Date()) {
  const results: { month: string; label: string; income: number; expense: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(reference, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const totals = await getTotalsByPeriod(userId, start, end);

    results.push({
      month: format(monthDate, "yyyy-MM"),
      label: format(monthDate, "MMM"),
      income: totals.income,
      expense: totals.expense,
    });
  }

  return results;
}

/** Gastos agrupados por categoria no mês de referência (para o gráfico de pizza). */
export async function getCategoryBreakdown(userId: string, reference = new Date()) {
  const start = startOfMonth(reference);
  const end = endOfMonth(reference);

  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: start, lte: end }, categoryId: { not: null } },
    _sum: { amount: true },
  });

  const categoryIds = grouped.map((g) => g.categoryId).filter((id): id is string => !!id);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const category = g.categoryId ? categoryMap.get(g.categoryId) : undefined;
      return {
        categoryId: g.categoryId ?? "sem-categoria",
        name: category?.name ?? "Sem categoria",
        color: category?.color ?? "#71717a",
        value: toNumber(g._sum.amount),
      };
    })
    .sort((a, b) => b.value - a.value);
}

/** Evolução patrimonial acumulada (saldo líquido acumulado mês a mês). */
export async function getNetWorthEvolution(userId: string, months = 12, reference = new Date()) {
  const monthly = await getLastNMonthsTotals(userId, months, reference);

  const accountsTotal = await prisma.account.aggregate({
    where: { userId, archived: false },
    _sum: { initialBalance: true },
  });
  const startingBalance = toNumber(accountsTotal._sum.initialBalance);

  let accumulated = startingBalance;
  return monthly.map((m) => {
    accumulated += m.income - m.expense;
    return { month: m.month, label: m.label, value: Number(accumulated.toFixed(2)) };
  });
}

/** Totais diários de despesas no mês — usado no heatmap financeiro. */
export async function getDailyExpenseHeatmap(userId: string, reference = new Date()) {
  const start = startOfMonth(reference);
  const end = endOfMonth(reference);

  const transactions = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
    select: { date: true, amount: true },
  });

  const totalsByDay = new Map<string, number>();
  for (const day of eachDayOfInterval({ start, end })) {
    totalsByDay.set(format(day, "yyyy-MM-dd"), 0);
  }
  for (const t of transactions) {
    const key = format(t.date, "yyyy-MM-dd");
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + toNumber(t.amount));
  }

  return Array.from(totalsByDay.entries()).map(([date, value]) => ({ date, value }));
}

/** Transações pendentes de vencimento nos próximos `days` dias (assinaturas + parcelas). */
export async function getUpcomingBillsTotal(userId: string, days = 7, reference = new Date()) {
  const end = new Date(reference);
  end.setDate(end.getDate() + days);

  const subscriptions = await prisma.recurringSubscription.aggregate({
    where: { userId, active: true, nextChargeDate: { gte: reference, lte: end } },
    _sum: { amount: true },
    _count: true,
  });

  return {
    total: toNumber(subscriptions._sum.amount),
    count: subscriptions._count,
  };
}
