import { formatCurrency } from "@/lib/utils";
import type { ReportData } from "@/services/report-service";

export function ReportCategoryTable({ data }: { data: ReportData["categoryBreakdown"] }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma movimentação no período</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((c) => (
        <div key={c.name} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </span>
          <div className="flex gap-4 text-right">
            {c.income > 0 && <span className="text-success">+{formatCurrency(c.income)}</span>}
            {c.expense > 0 && <span className="text-destructive">-{formatCurrency(c.expense)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
