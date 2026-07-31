import { prisma } from "@/lib/prisma";
import { addMonths, format } from "date-fns";
import { getLastNMonthsTotals } from "@/lib/repositories/transaction-repository";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

/**
 * Projeta os próximos `months` meses somando: a média de receita/despesa dos
 * últimos 3 meses (linha de base) + o total conhecido de assinaturas
 * recorrentes ativas (valor certo, não estimado). É uma projeção simples —
 * não considera sazonalidade nem parcelas futuras já lançadas (essas já
 * aparecem como transações reais em meses futuros e não entram na "previsão").
 */
export async function getCashFlowForecast(userId: string, months = 6) {
  const history = await getLastNMonthsTotals(userId, 3).catch(() => []);
  const avgIncome = history.reduce((s, m) => s + m.income, 0) / (history.length || 1);
  const avgExpense = history.reduce((s, m) => s + m.expense, 0) / (history.length || 1);

  const subscriptions = await prisma.recurringSubscription.aggregate({
    where: { userId, active: true },
    _sum: { amount: true },
  });
  const knownRecurringExpense = toNumber(subscriptions._sum.amount);

  const now = new Date();
  const forecast: { month: string; label: string; income: number; expense: number; net: number }[] = [];

  let cumulative = 0;
  for (let i = 1; i <= months; i++) {
    const monthDate = addMonths(now, i);
    const income = avgIncome;
    const expense = Math.max(avgExpense, knownRecurringExpense);
    cumulative += income - expense;

    forecast.push({
      month: format(monthDate, "yyyy-MM"),
      label: format(monthDate, "MMM"),
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      net: Number(cumulative.toFixed(2)),
    });
  }

  return forecast;
}
