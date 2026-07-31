import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BUDGET_PERIODS } from "@/lib/validations/budget";
import { getIcon } from "@/lib/icon-map";
import { cn, formatCurrency } from "@/lib/utils";
import type { findBudgets } from "@/lib/repositories/budget-repository";

type BudgetItem = Awaited<ReturnType<typeof findBudgets>>[number];

interface BudgetProgressCardProps {
  budget: BudgetItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function BudgetProgressCard({ budget, onEdit, onDelete }: BudgetProgressCardProps) {
  const Icon = getIcon(budget.category.icon);
  const periodLabel = BUDGET_PERIODS.find((p) => p.value === budget.period)?.label;

  return (
    <Card className={cn(budget.isOverLimit && "border-destructive/50")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: budget.category.color }}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-medium">{budget.category.name}</p>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="size-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
                <Trash2 className="size-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className={cn("font-semibold", budget.isOverLimit && "text-destructive")}>
              {budget.percent}%
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
            </span>
          </div>
          <Progress
            value={Math.min(100, budget.percent)}
            indicatorClassName={cn(budget.isOverLimit && "bg-destructive")}
          />
        </div>

        {budget.isOverLimit && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3.5" /> Limite ultrapassado
          </p>
        )}
        {!budget.isOverLimit && budget.isNearLimit && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <AlertTriangle className="size-3.5" /> Próximo do limite
          </p>
        )}
      </CardContent>
    </Card>
  );
}
