"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, CreditCard, Repeat, TrendingUp as InvestIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import type { CalendarDay, CalendarEventType } from "@/services/calendar-service";

const EVENT_ICON: Record<CalendarEventType, typeof TrendingUp> = {
  income: TrendingUp,
  expense: TrendingDown,
  "card-due": CreditCard,
  subscription: Repeat,
  investment: InvestIcon,
};

const EVENT_COLOR: Record<CalendarEventType, string> = {
  income: "text-success",
  expense: "text-destructive",
  "card-due": "text-secondary",
  subscription: "text-primary",
  investment: "text-amber-600",
};

interface CalendarDayDialogProps {
  day: CalendarDay | null;
  onOpenChange: (open: boolean) => void;
}

export function CalendarDayDialog({ day, onOpenChange }: CalendarDayDialogProps) {
  return (
    <Dialog open={!!day} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {day && format(day.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        {day && day.events.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Nenhum evento neste dia" className="py-8" />
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {day?.events.map((event, i) => {
              const Icon = EVENT_ICON[event.type];
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className={`size-4 ${EVENT_COLOR[event.type]}`} />
                    {event.label}
                  </span>
                  <span className={EVENT_COLOR[event.type]}>{formatCurrency(event.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
