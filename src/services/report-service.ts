import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { ReportFilters } from "@/lib/validations/report";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

/** Resolve o período selecionado em um intervalo [start, end] concreto. */
export function resolveReportRange(filters: ReportFilters): { start: Date; end: Date; label: string } {
  const ref = filters.referenceDate;

  switch (filters.period) {
    case "QUARTER":
      return { start: startOfQuarter(ref), end: endOfQuarter(ref), label: "Trimestre" };
    case "SEMESTER": {
      // date-fns não tem helper de semestre — calculamos manualmente (2 blocos de 6 meses)
      const semesterStartMonth = ref.getMonth() < 6 ? 0 : 6;
      const start = new Date(ref.getFullYear(), semesterStartMonth, 1);
      const end = endOfMonth(new Date(ref.getFullYear(), semesterStartMonth + 5, 1));
      return { start, end, label: "Semestre" };
    }
    case "YEAR":
      return { start: startOfYear(ref), end: endOfYear(ref), label: "Ano" };
    case "CUSTOM":
      return { start: filters.customFrom!, end: filters.customTo!, label: "Personalizado" };
    default:
      return { start: startOfMonth(ref), end: endOfMonth(ref), label: "Mês" };
  }
}

export interface ReportData {
  range: { start: Date; end: Date; label: string };
  totals: { income: number; expense: number; balance: number };
  previousTotals: { income: number; expense: number; balance: number };
  categoryBreakdown: { name: string; color: string; income: number; expense: number }[];
  transactions: {
    id: string;
    date: Date;
    title: string;
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: string | null;
    account: string | null;
    card: string | null;
  }[];
}

export async function getReportData(userId: string, filters: ReportFilters): Promise<ReportData> {
  const range = resolveReportRange(filters);
  const durationMs = range.end.getTime() - range.start.getTime();
  const previousRange = {
    start: new Date(range.start.getTime() - durationMs - 1),
    end: new Date(range.start.getTime() - 1),
  };

  const [transactions, previousAgg] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: range.start, lte: range.end } },
      orderBy: { date: "desc" },
      include: {
        category: { select: { name: true, color: true } },
        account: { select: { name: true } },
        card: { select: { name: true } },
      },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: previousRange.start, lte: previousRange.end } },
      _sum: { amount: true },
    }),
  ]);

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + toNumber(t.amount), 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + toNumber(t.amount), 0);

  const prevIncome = toNumber(previousAgg.find((a) => a.type === "INCOME")?._sum.amount);
  const prevExpense = toNumber(previousAgg.find((a) => a.type === "EXPENSE")?._sum.amount);

  const categoryMap = new Map<string, { name: string; color: string; income: number; expense: number }>();
  for (const t of transactions) {
    const key = t.category?.name ?? "Sem categoria";
    const entry = categoryMap.get(key) ?? {
      name: key,
      color: t.category?.color ?? "#71717a",
      income: 0,
      expense: 0,
    };
    if (t.type === "INCOME") entry.income += toNumber(t.amount);
    else entry.expense += toNumber(t.amount);
    categoryMap.set(key, entry);
  }

  return {
    range,
    totals: { income, expense, balance: income - expense },
    previousTotals: { income: prevIncome, expense: prevExpense, balance: prevIncome - prevExpense },
    categoryBreakdown: Array.from(categoryMap.values()).sort((a, b) => b.expense - a.expense),
    transactions: transactions.map((t) => ({
      id: t.id,
      date: t.date,
      title: t.title,
      type: t.type,
      amount: toNumber(t.amount),
      category: t.category?.name ?? null,
      account: t.account?.name ?? null,
      card: t.card?.name ?? null,
    })),
  };
}
