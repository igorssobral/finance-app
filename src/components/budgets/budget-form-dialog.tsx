"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BudgetForm } from "@/components/budgets/budget-form";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import type { BudgetInput } from "@/lib/validations/budget";

interface BudgetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<BudgetInput> } | null;
}

export function BudgetFormDialog({ open, onOpenChange, editing }: BudgetFormDialogProps) {
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: BudgetInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize o limite do orçamento." : "Defina um limite de gastos por categoria."}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar orçamento"}
          isSubmitting={isSubmitting}
          lockCategory={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
