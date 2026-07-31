import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart as LineChartIcon,
} from "lucide-react";
import { getDashboardSummary } from "@/services/dashboard-service";
import { generateDashboardInsights } from "@/services/insights-service";
import { getCashFlowForecast } from "@/services/forecast-service";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  UpcomingBillsCard,
  CardInvoiceCard,
  MonthlyGoalCard,
} from "@/components/dashboard/special-cards";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { AssistantWidget } from "@/components/ai/assistant-widget";
import { ChartCard } from "@/components/dashboard/charts/chart-card";
import {
  IncomeExpenseChart,
  CashFlowChart,
  CategoryPieChart,
  NetWorthChart,
  FinancialHeatmap,
  CashFlowForecastChart,
} from "@/components/dashboard/dynamic-charts";

export async function DashboardContent({ userId }: { userId: string }) {
  const summary = await getDashboardSummary(userId);
  const insights = await generateDashboardInsights(userId, {
    savings: summary.cards.savings,
  });
  const forecast = await getCashFlowForecast(userId, 6);

  const { cards, charts } = summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo atual"
          value={cards.balance.value}
          changePercent={cards.balance.changePercent}
          isPositiveGood={cards.balance.isPositiveGood}
          icon="wallet"
          tooltip="Saldo de todas as contas somado ao resultado do período"
          delay={0}
        />
        <StatCard
          title="Receitas do mês"
          value={cards.income.value}
          changePercent={cards.income.changePercent}
          isPositiveGood={cards.income.isPositiveGood}
          icon="trending-up"
          delay={0.05}
        />
        <StatCard
          title="Despesas do mês"
          value={cards.expense.value}
          changePercent={cards.expense.changePercent}
          isPositiveGood={cards.expense.isPositiveGood}
          icon="trending-down"
          delay={0.1}
        />
        <StatCard
          title="Economia"
          value={cards.savings.value}
          changePercent={cards.savings.changePercent}
          isPositiveGood={cards.savings.isPositiveGood}
          icon="piggy-bank"
          tooltip="Receitas menos despesas do mês"
          delay={0.15}
        />
        <StatCard
          title="Valor investido"
          value={cards.invested.value}
          changePercent={cards.invested.changePercent}
          isPositiveGood={cards.invested.isPositiveGood}
          icon="line-chart"
          tooltip="Patrimônio total em investimentos"
          delay={0.2}
        />
        <UpcomingBillsCard
          total={cards.upcomingBills.total}
          count={cards.upcomingBills.count}
          delay={0.25}
        />
        <CardInvoiceCard
          total={cards.cardInvoice.total}
          cardCount={cards.cardInvoice.cardCount}
          delay={0.3}
        />
        <MonthlyGoalCard
          current={cards.monthlyGoal.current}
          target={cards.monthlyGoal.target}
          percent={cards.monthlyGoal.percent}
          delay={0.35}
        />
      </div>

      <InsightsCard insights={insights} />

      <AssistantWidget />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Receitas x Despesas"
          description="Comparativo dos últimos 12 meses"
        >
          <IncomeExpenseChart data={charts.incomeExpense} />
        </ChartCard>

        <ChartCard title="Fluxo de Caixa" description="Resultado líquido mês a mês">
          <CashFlowChart data={charts.incomeExpense} />
        </ChartCard>

        <ChartCard title="Gastos por Categoria" description="Mês atual">
          <CategoryPieChart data={charts.categoryBreakdown} />
        </ChartCard>

        <ChartCard title="Evolução Patrimonial" description="Saldo acumulado nos últimos 12 meses">
          <NetWorthChart data={charts.netWorth} />
        </ChartCard>

        <ChartCard
          title="Heatmap Financeiro"
          description="Intensidade de gastos por dia neste mês"
          className="lg:col-span-2"
        >
          <FinancialHeatmap data={charts.heatmap} />
        </ChartCard>

        <ChartCard
          title="Previsão de Fluxo de Caixa"
          description="Projeção dos próximos 6 meses com base na média recente e assinaturas ativas"
          className="lg:col-span-2"
        >
          <CashFlowForecastChart data={forecast} />
        </ChartCard>
      </div>
    </div>
  );
}
