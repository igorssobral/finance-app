"use client";

import * as React from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { useGoalsQuery, useDeleteGoal } from "@/hooks/use-goals";
import type { GoalWithProgress } from "@/lib/repositories/goal-repository";

export default function MetasPage() {
  const { data: goals, isLoading } = useGoalsQuery();
  const deleteMutation = useDeleteGoal();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GoalWithProgress | null>(null);
  const [deleting, setDeleting] = React.useState<GoalWithProgress | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description="Defina e acompanhe suas metas financeiras"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova meta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !goals || goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description="Crie metas para acompanhar seu progresso rumo aos seus objetivos."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => {
                setEditing(goal);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(goal)}
            />
          ))}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  title: editing.title,
                  targetAmount: editing.targetAmount,
                  currentAmount: editing.currentAmount,
                  targetDate: editing.targetDate ?? undefined,
                  color: editing.color,
                  icon: editing.icon,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir meta?"
        description={`Tem certeza que deseja excluir "${deleting?.title}"?`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
