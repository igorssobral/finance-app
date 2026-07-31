"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart as LineChartIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  wallet: Wallet,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "piggy-bank": PiggyBank,
  "line-chart": LineChartIcon,
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  changePercent?: number;
  isPositiveGood?: boolean;
  tooltip?: string;
  currency?: string;
  delay?: number;
  formatAsCurrency?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  changePercent,
  isPositiveGood = true,
  tooltip,
  currency = "BRL",
  delay = 0,
  formatAsCurrency = true,
}: StatCardProps) {
  const hasChange = typeof changePercent === "number";
  const Icon = ICON_MAP[icon] ?? Wallet;
  const isUp = (changePercent ?? 0) >= 0;
  // Verde quando a direção da variação é "boa" (ex: receita subindo, despesa descendo)
  const isGoodChange = isUp === isPositiveGood;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-1.5">
            {title}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-muted-foreground/60">ⓘ</span>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </CardTitle>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">
            {formatAsCurrency ? formatCurrency(value, currency) : value.toLocaleString("pt-BR")}
          </div>
          {hasChange && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  isGoodChange
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {formatPercent(changePercent!)}
              </span>
              <span className="text-muted-foreground">vs. mês anterior</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
