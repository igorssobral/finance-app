"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoalForm } from "@/components/goals/goal-form";
import { useCreateGoal, useUpdateGoal } from "@/hooks/use-goals";
import type { GoalInput } from "@/lib/validations/goal";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<GoalInput> } | null;
}

export function GoalFormDialog({ open, onOpenChange, editing }: GoalFormDialogProps) {
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: GoalInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize o progresso da meta." : "Defina uma nova meta financeira."}
          </DialogDescription>
        </DialogHeader>
        <GoalForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar meta"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
