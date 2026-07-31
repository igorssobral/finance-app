"use client";

import * as React from "react";
import { format, getDay, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";

interface DataPoint {
  date: string; // yyyy-MM-dd
  value: number;
}

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function intensityClass(value: number, max: number) {
  if (value <= 0) return "bg-muted";
  const ratio = value / max;
  if (ratio > 0.75) return "bg-primary";
  if (ratio > 0.5) return "bg-primary/70";
  if (ratio > 0.25) return "bg-primary/40";
  return "bg-primary/20";
}

export function FinancialHeatmap({ data }: { data: DataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const firstDay = data[0] ? startOfMonth(new Date(data[0].date)) : new Date();
  const leadingBlanks = getDay(firstDay); // 0 (domingo) a 6

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {data.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "aspect-square rounded-sm transition-colors",
                    intensityClass(day.value, max),
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">
                  {format(new Date(day.date), "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-muted-foreground">{formatCurrency(day.value)} em despesas</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-muted-foreground">
          <span>Menos</span>
          <div className="size-3 rounded-sm bg-muted" />
          <div className="size-3 rounded-sm bg-primary/20" />
          <div className="size-3 rounded-sm bg-primary/40" />
          <div className="size-3 rounded-sm bg-primary/70" />
          <div className="size-3 rounded-sm bg-primary" />
          <span>Mais</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
