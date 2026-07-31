"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarDayDialog } from "@/components/calendar/calendar-day-dialog";
import { useCalendarMonthQuery } from "@/hooks/use-calendar";
import type { CalendarDay } from "@/services/calendar-service";

const LEGEND = [
  { label: "Receita", color: "bg-success" },
  { label: "Despesa", color: "bg-destructive" },
  { label: "Fatura do cartão", color: "bg-secondary" },
  { label: "Assinatura", color: "bg-primary" },
  { label: "Investimento", color: "bg-amber-500" },
];

export default function CalendarioPage() {
  const [reference, setReference] = React.useState(new Date());
  const [selectedDay, setSelectedDay] = React.useState<CalendarDay | null>(null);

  const { data: days, isLoading } = useCalendarMonthQuery(reference.getFullYear(), reference.getMonth());

  function shiftMonth(direction: 1 | -1) {
    setReference((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário Financeiro"
        description="Contas a vencer, faturas, assinaturas e investimentos do mês"
      />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-40 text-center text-sm font-medium capitalize">
          {format(reference, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button variant="outline" size="icon" onClick={() => shiftMonth(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {isLoading || !days ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <CalendarGrid days={days} onSelectDay={setSelectedDay} />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>

      <CalendarDayDialog day={selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)} />
    </div>
  );
}
