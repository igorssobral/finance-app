"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  month: string;
  label: string;
  net: number;
}

export function CashFlowForecastChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: 8, right: 8 }}>
        <defs>
          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="net" name="Saldo projetado" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="url(#forecastGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
