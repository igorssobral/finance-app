import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getIcon } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/utils";
import type { GoalWithProgress } from "@/lib/repositories/goal-repository";

interface GoalCardProps {
  goal: GoalWithProgress;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const Icon = getIcon(goal.icon);
  const isAchieved = goal.status === "ACHIEVED";

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: goal.color }}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-medium">{goal.title}</p>
              {isAchieved ? (
                <p className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3.5" /> Meta concluída
                </p>
              ) : (
                goal.targetDate && (
                  <p className="text-xs text-muted-foreground">
                    Alvo: {format(new Date(goal.targetDate), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                )
              )}
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
            <span className="font-semibold">{goal.percent}%</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <Progress value={goal.percent} />
        </div>

        {!isAchieved && goal.estimatedCompletionDate && (
          <p className="text-xs text-muted-foreground">
            Previsão de conclusão:{" "}
            <span className="font-medium text-foreground">
              {format(new Date(goal.estimatedCompletionDate), "MMMM 'de' yyyy", { locale: ptBR })}
            </span>{" "}
            (~{goal.monthsRemaining} {goal.monthsRemaining === 1 ? "mês" : "meses"}, no ritmo atual)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
