import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight } from "@/services/insights-service";

const TONE_ICON = {
  warning: TrendingDown,
  positive: TrendingUp,
  neutral: Sparkles,
} as const;

const TONE_STYLE = {
  warning: "bg-destructive/10 text-destructive",
  positive: "bg-success/10 text-success",
  neutral: "bg-secondary/10 text-secondary",
} as const;

export function InsightsCard({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">
          Dashboard Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight) => {
          const Icon = TONE_ICON[insight.tone];
          return (
            <div key={insight.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", TONE_STYLE[insight.tone])}>
                <Icon className="size-3.5" />
              </div>
              <p className="text-sm">{insight.message}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
