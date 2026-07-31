"use client";

import * as React from "react";
import { Plus, PiggyBank } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { BudgetProgressCard } from "@/components/budgets/budget-progress-card";
import { useBudgetsQuery, useDeleteBudget } from "@/hooks/use-budgets";
import type { findBudgets } from "@/lib/repositories/budget-repository";

type BudgetItem = Awaited<ReturnType<typeof findBudgets>>[number];

export default function OrcamentosPage() {
  const { data: budgets, isLoading } = useBudgetsQuery();
  const deleteMutation = useDeleteBudget();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetItem | null>(null);
  const [deleting, setDeleting] = React.useState<BudgetItem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Defina limites de gastos por categoria"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo orçamento
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Nenhum orçamento cadastrado"
          description="Defina limites de gastos por categoria para manter o controle do mês."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetProgressCard
              key={budget.id}
              budget={budget}
              onEdit={() => {
                setEditing(budget);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(budget)}
            />
          ))}
        </div>
      )}

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  categoryId: editing.categoryId,
                  limit: editing.limit,
                  period: editing.period,
                  alertAt: editing.alertAt,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir orçamento?"
        description={`Tem certeza que deseja excluir o orçamento de "${deleting?.category.name}"?`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
