"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import type { TransactionInput } from "@/lib/validations/transaction";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando presente, o dialog abre em modo edição. */
  editing?: { id: string; values: Partial<TransactionInput> } | null;
}

export function TransactionFormDialog({ open, onOpenChange, editing }: TransactionFormDialogProps) {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: TransactionInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);

    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar transação" : "Nova transação"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da transação selecionada."
              : "Registre uma nova receita ou despesa."}
          </DialogDescription>
        </DialogHeader>

        {/* key força remount ao trocar entre criar/editar, resetando o formulário */}
        <TransactionForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar transação"}
          isSubmitting={isSubmitting}
          showAiShortcuts={!isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
