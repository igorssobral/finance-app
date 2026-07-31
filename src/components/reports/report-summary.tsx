import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { ReportData } from "@/services/report-service";

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function ReportSummary({ report }: { report: ReportData }) {
  const items = [
    {
      label: "Receitas",
      value: report.totals.income,
      previous: report.previousTotals.income,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Despesas",
      value: report.totals.expense,
      previous: report.previousTotals.expense,
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      label: "Saldo do período",
      value: report.totals.balance,
      previous: report.previousTotals.balance,
      icon: Scale,
      color: report.totals.balance >= 0 ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const change = percentChange(item.value, item.previous);
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{item.label}</CardTitle>
              <item.icon className={cn("size-4", item.color)} />
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-semibold tracking-tight", item.color)}>
                {formatCurrency(item.value)}
              </p>
              {change !== null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPercent(change)} vs. período anterior
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
