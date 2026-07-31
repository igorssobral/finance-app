"use client";

/**
 * Recharts depende de medir o DOM (ResponsiveContainer), então renderizar no
 * servidor sempre produz um flash de altura 0 antes da hidratação. Carregando
 * esses componentes com `ssr: false` evitamos esse flash e tiramos ~parte do
 * bundle do Recharts do HTML inicial — ele só chega ao navegador quando esta
 * seção realmente for renderizada.
 *
 * Precisa estar em um arquivo "use client" porque `ssr: false` só é permitido
 * dentro da árvore de Client Components — `dashboard-content.tsx` (que importa
 * este arquivo) continua sendo um Server Component normalmente.
 */
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full" />;
const SmallChartSkeleton = () => <Skeleton className="h-[260px] w-full" />;

export const IncomeExpenseChart = dynamic(
  () => import("@/components/dashboard/charts/income-expense-chart").then((m) => m.IncomeExpenseChart),
  { ssr: false, loading: ChartSkeleton },
);

export const CashFlowChart = dynamic(
  () => import("@/components/dashboard/charts/cash-flow-chart").then((m) => m.CashFlowChart),
  { ssr: false, loading: ChartSkeleton },
);

export const CategoryPieChart = dynamic(
  () => import("@/components/dashboard/charts/category-pie-chart").then((m) => m.CategoryPieChart),
  { ssr: false, loading: ChartSkeleton },
);

export const NetWorthChart = dynamic(
  () => import("@/components/dashboard/charts/net-worth-chart").then((m) => m.NetWorthChart),
  { ssr: false, loading: ChartSkeleton },
);

export const FinancialHeatmap = dynamic(
  () => import("@/components/dashboard/charts/financial-heatmap").then((m) => m.FinancialHeatmap),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full" /> },
);

export const CashFlowForecastChart = dynamic(
  () =>
    import("@/components/dashboard/charts/cash-flow-forecast-chart").then((m) => m.CashFlowForecastChart),
  { ssr: false, loading: SmallChartSkeleton },
);
