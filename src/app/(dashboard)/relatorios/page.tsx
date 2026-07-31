"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportPeriodSelector } from "@/components/reports/report-period-selector";
import { ReportSummary } from "@/components/reports/report-summary";
import { ReportCategoryTable } from "@/components/reports/report-category-table";
import { ReportExportMenu } from "@/components/reports/report-export-menu";
import { useReportQuery } from "@/hooks/use-reports";
import type { ReportFilters } from "@/lib/validations/report";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_FILTERS: Partial<ReportFilters> = { period: "MONTH", referenceDate: new Date() };

export default function RelatoriosPage() {
  const [filters, setFilters] = React.useState<Partial<ReportFilters>>(DEFAULT_FILTERS);
  const isCustomIncomplete = filters.period === "CUSTOM" && (!filters.customFrom || !filters.customTo);

  const { data: report, isLoading } = useReportQuery(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Analise suas finanças por período e exporte os dados"
        action={report && <ReportExportMenu report={report} />}
      />

      <ReportPeriodSelector filters={filters} onChange={setFilters} />

      {isCustomIncomplete ? (
        <EmptyState icon={FileBarChart} title="Selecione o período personalizado" description="Escolha a data inicial e final para gerar o relatório." />
      ) : isLoading || !report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {report.range.label} — {format(new Date(report.range.start), "dd MMM yyyy", { locale: ptBR })} a{" "}
            {format(new Date(report.range.end), "dd MMM yyyy", { locale: ptBR })}
          </p>

          <ReportSummary report={report} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Gastos por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportCategoryTable data={report.categoryBreakdown} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Transações do período ({report.transactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 space-y-1 overflow-y-auto">
              {report.transactions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Nenhuma transação neste período
                </p>
              ) : (
                report.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted/40">
                    <div>
                      <p>{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.date), "dd MMM yyyy", { locale: ptBR })}
                        {t.category ? ` · ${t.category}` : ""}
                      </p>
                    </div>
                    <span className={t.type === "INCOME" ? "text-success" : "text-destructive"}>
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
