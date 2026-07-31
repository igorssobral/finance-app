"use client";

import { motion } from "framer-motion";
import { CalendarClock, CreditCard, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function UpcomingBillsCard({ total, count, delay = 0 }: { total: number; count: number; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Contas a vencer</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <CalendarClock className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{formatCurrency(total)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {count === 0 ? "Nenhuma conta nos próximos 7 dias" : `${count} conta(s) nos próximos 7 dias`}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CardInvoiceCard({ total, cardCount, delay = 0 }: { total: number; cardCount: number; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Fatura do cartão</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{formatCurrency(total)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {cardCount === 0 ? "Nenhum cartão cadastrado" : `Fatura aberta em ${cardCount} cartão(ões)`}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonthlyGoalCard({
  current,
  target,
  percent,
  delay = 0,
}: {
  current: number;
  target: number;
  percent: number;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Meta mensal</CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <Target className="size-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight">{percent}%</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(current)} de {formatCurrency(target)}
            </span>
          </div>
          <Progress value={percent} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
