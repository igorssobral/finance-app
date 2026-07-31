"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CardForm } from "@/components/cards/card-form";
import { useCreateCard, useUpdateCard } from "@/hooks/use-cards";
import type { CardInput } from "@/lib/validations/card";

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<CardInput> } | null;
}

export function CardFormDialog({ open, onOpenChange, editing }: CardFormDialogProps) {
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: CardInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cartão" : "Novo cartão"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do cartão." : "Cadastre um novo cartão de crédito."}
          </DialogDescription>
        </DialogHeader>
        <CardForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar cartão"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
