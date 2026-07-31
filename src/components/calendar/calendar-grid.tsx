"use client";

import { getDay, isToday } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import type { CalendarDay } from "@/services/calendar-service";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const EVENT_DOT_COLOR: Record<string, string> = {
  income: "bg-success",
  expense: "bg-destructive",
  "card-due": "bg-secondary",
  subscription: "bg-primary",
  investment: "bg-amber-500",
};

interface CalendarGridProps {
  days: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
}

export function CalendarGrid({ days, onSelectDay }: CalendarGridProps) {
  const leadingBlanks = days[0] ? getDay(days[0].date) : 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const net = day.totalIncome - day.totalExpense;
          const eventTypes = Array.from(new Set(day.events.map((e) => e.type)));

          return (
            <button
              key={day.day}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex aspect-square flex-col items-start rounded-lg border border-border p-1.5 text-left transition-colors hover:border-primary/50 hover:bg-accent/50",
                isToday(day.date) && "border-primary bg-primary/5",
              )}
            >
              <span className={cn("text-xs font-medium", isToday(day.date) && "text-primary")}>
                {day.day}
              </span>
              {net !== 0 && (
                <span className={cn("mt-auto text-[10px] font-medium", net > 0 ? "text-success" : "text-destructive")}>
                  {net > 0 ? "+" : ""}
                  {formatCurrency(net)}
                </span>
              )}
              {eventTypes.length > 0 && (
                <div className="mt-1 flex gap-0.5">
                  {eventTypes.slice(0, 4).map((type) => (
                    <span key={type} className={cn("size-1.5 rounded-full", EVENT_DOT_COLOR[type])} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
