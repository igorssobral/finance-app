import {
  getCurrentAndPreviousMonthTotals,
  getLastNMonthsTotals,
  getCategoryBreakdown,
  getNetWorthEvolution,
  getDailyExpenseHeatmap,
  getUpcomingBillsTotal,
} from "@/lib/repositories/transaction-repository";
import { withDbFallback } from "@/lib/repositories/repository-utils";
import {
  getCurrentBalance,
  getInvestmentSummary,
  getInvestedThisMonthVsPrevious,
  getOpenCardInvoiceTotal,
  getGoalsProgress,
} from "@/lib/repositories/account-repository";

/** Variação percentual entre dois valores, protegida contra divisão por zero. */
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export interface StatCardData {
  key: string;
  value: number;
  changePercent: number;
  isPositiveGood: boolean; // se true, alta = verde; se false, alta = vermelho (ex: despesas)
}

export interface DashboardSummary {
  cards: {
    balance: StatCardData;
    income: StatCardData;
    expense: StatCardData;
    savings: StatCardData;
    invested: StatCardData;
    upcomingBills: { total: number; count: number };
    cardInvoice: { total: number; cardCount: number };
    monthlyGoal: { current: number; target: number; percent: number };
  };
  charts: {
    incomeExpense: { month: string; label: string; income: number; expense: number }[];
    categoryBreakdown: { categoryId: string; name: string; color: string; value: number }[];
    netWorth: { month: string; label: string; value: number }[];
    heatmap: { date: string; value: number }[];
  };
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const reference = new Date();

  const [
    balance,
    { current: currentTotals, previous: previousTotals },
    investmentSummary,
    investedComparison,
    cardInvoice,
    goalsProgress,
    upcomingBills,
    monthlyHistory,
    categoryBreakdown,
    netWorth,
    heatmap,
  ] = await Promise.all([
    withDbFallback(() => getCurrentBalance(userId), 0),
    withDbFallback(() => getCurrentAndPreviousMonthTotals(userId, reference), {
      current: { income: 0, expense: 0 },
      previous: { income: 0, expense: 0 },
    }),
    withDbFallback(() => getInvestmentSummary(userId), { invested: 0, current: 0, profit: 0 }),
    withDbFallback(() => getInvestedThisMonthVsPrevious(userId, reference), { current: 0, previous: 0 }),
    withDbFallback(() => getOpenCardInvoiceTotal(userId), { total: 0, cards: [] }),
    withDbFallback(() => getGoalsProgress(userId), { target: 0, current: 0, percent: 0 }),
    withDbFallback(() => getUpcomingBillsTotal(userId, 7, reference), { total: 0, count: 0 }),
    withDbFallback(() => getLastNMonthsTotals(userId, 12, reference), []),
    withDbFallback(() => getCategoryBreakdown(userId, reference), []),
    withDbFallback(() => getNetWorthEvolution(userId, 12, reference), []),
    withDbFallback(() => getDailyExpenseHeatmap(userId, reference), []),
  ]);

  const currentSavings = currentTotals.income - currentTotals.expense;
  const previousSavings = previousTotals.income - previousTotals.expense;

  // Saldo atual não tem "mês anterior" direto — aproximamos pelo saldo do fim do
  // mês passado (saldo atual menos o resultado do mês corrente).
  const previousBalance = balance - currentSavings;

  return {
    cards: {
      balance: {
        key: "balance",
        value: balance,
        changePercent: percentChange(balance, previousBalance),
        isPositiveGood: true,
      },
      income: {
        key: "income",
        value: currentTotals.income,
        changePercent: percentChange(currentTotals.income, previousTotals.income),
        isPositiveGood: true,
      },
      expense: {
        key: "expense",
        value: currentTotals.expense,
        changePercent: percentChange(currentTotals.expense, previousTotals.expense),
        isPositiveGood: false,
      },
      savings: {
        key: "savings",
        value: currentSavings,
        changePercent: percentChange(currentSavings, previousSavings),
        isPositiveGood: true,
      },
      invested: {
        key: "invested",
        value: investmentSummary.current,
        changePercent: percentChange(investedComparison.current, investedComparison.previous),
        isPositiveGood: true,
      },
      upcomingBills,
      cardInvoice: { total: cardInvoice.total, cardCount: cardInvoice.cards.length },
      monthlyGoal: goalsProgress,
    },
    charts: {
      incomeExpense: monthlyHistory,
      categoryBreakdown,
      netWorth,
      heatmap,
    },
  };
}
