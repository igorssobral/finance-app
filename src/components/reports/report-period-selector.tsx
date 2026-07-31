"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REPORT_PERIODS, type ReportFilters } from "@/lib/validations/report";

interface ReportPeriodSelectorProps {
  filters: Partial<ReportFilters>;
  onChange: (filters: Partial<ReportFilters>) => void;
}

export function ReportPeriodSelector({ filters, onChange }: ReportPeriodSelectorProps) {
  const period = filters.period ?? "MONTH";
  const referenceDate = filters.referenceDate ?? new Date();

  function shiftReference(direction: 1 | -1) {
    const next = new Date(referenceDate);
    if (period === "MONTH") next.setMonth(next.getMonth() + direction);
    else if (period === "QUARTER") next.setMonth(next.getMonth() + direction * 3);
    else if (period === "SEMESTER") next.setMonth(next.getMonth() + direction * 6);
    else if (period === "YEAR") next.setFullYear(next.getFullYear() + direction);
    onChange({ ...filters, referenceDate: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs
        value={period}
        onValueChange={(value) => onChange({ ...filters, period: value as ReportFilters["period"] })}
      >
        <TabsList>
          {REPORT_PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>{p.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {period === "CUSTOM" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.customFrom ? new Date(filters.customFrom).toISOString().slice(0, 10) : ""}
            onChange={(e) => onChange({ ...filters, customFrom: e.target.value ? new Date(e.target.value) : undefined })}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="date"
            value={filters.customTo ? new Date(filters.customTo).toISOString().slice(0, 10) : ""}
            onChange={(e) => onChange({ ...filters, customTo: e.target.value ? new Date(e.target.value) : undefined })}
          />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => shiftReference(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">
            {format(referenceDate, period === "YEAR" ? "yyyy" : "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={() => shiftReference(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
