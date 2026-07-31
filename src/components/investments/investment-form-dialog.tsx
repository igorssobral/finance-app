"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InvestmentForm } from "@/components/investments/investment-form";
import { useCreateInvestment, useUpdateInvestment } from "@/hooks/use-investments";
import type { InvestmentInput } from "@/lib/validations/investment";

interface InvestmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<InvestmentInput> } | null;
}

export function InvestmentFormDialog({ open, onOpenChange, editing }: InvestmentFormDialogProps) {
  const createMutation = useCreateInvestment();
  const updateMutation = useUpdateInvestment();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: InvestmentInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar investimento" : "Novo investimento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do investimento." : "Cadastre um novo investimento."}
          </DialogDescription>
        </DialogHeader>
        <InvestmentForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar investimento"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
