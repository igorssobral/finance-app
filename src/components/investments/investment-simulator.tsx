"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

/** Calcula a evolução mês a mês: saldo(n) = (saldo(n-1) + aporte) x (1 + taxa mensal). */
function simulate(initial: number, monthlyContribution: number, monthlyRatePercent: number, months: number) {
  const rate = monthlyRatePercent / 100;
  const points: { month: number; value: number }[] = [{ month: 0, value: initial }];

  let balance = initial;
  for (let m = 1; m <= months; m++) {
    balance = (balance + monthlyContribution) * (1 + rate);
    points.push({ month: m, value: Number(balance.toFixed(2)) });
  }
  return points;
}

export function InvestmentSimulator() {
  const [initial, setInitial] = React.useState(1000);
  const [monthlyContribution, setMonthlyContribution] = React.useState(300);
  const [monthlyRate, setMonthlyRate] = React.useState(0.8);
  const [months, setMonths] = React.useState(24);

  const points = React.useMemo(
    () => simulate(initial, monthlyContribution, monthlyRate, months),
    [initial, monthlyContribution, monthlyRate, months],
  );

  const finalValue = points[points.length - 1]?.value ?? 0;
  const totalContributed = initial + monthlyContribution * months;
  const totalYield = finalValue - totalContributed;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Simulador de Investimentos</CardTitle>
        <CardDescription>Projeção com juros compostos — apenas uma estimativa, não uma promessa de rendimento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="sim-initial">Valor inicial</Label>
            <Input
              id="sim-initial"
              type="number"
              min="0"
              value={initial}
              onChange={(e) => setInitial(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sim-contribution">Aporte mensal</Label>
            <Input
              id="sim-contribution"
              type="number"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sim-rate">Taxa mensal (%)</Label>
            <Input
              id="sim-rate"
              type="number"
              step="0.01"
              min="0"
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sim-months">Período (meses)</Label>
            <Input
              id="sim-months"
              type="number"
              min="1"
              max="600"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Valor final</p>
            <p className="font-semibold text-success">{formatCurrency(finalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total aportado</p>
            <p className="font-semibold">{formatCurrency(totalContributed)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rendimento total</p>
            <p className="font-semibold text-primary">{formatCurrency(totalYield)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={points} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(m) => `${m}m`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(m) => `Mês ${m}`}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
