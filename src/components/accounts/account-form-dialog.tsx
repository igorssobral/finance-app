"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AccountForm } from "@/components/accounts/account-form";
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import type { AccountInput } from "@/lib/validations/account";

interface AccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<AccountInput> } | null;
}

export function AccountFormDialog({ open, onOpenChange, editing }: AccountFormDialogProps) {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: AccountInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar conta" : "Nova conta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados da conta." : "Cadastre uma nova conta."}
          </DialogDescription>
        </DialogHeader>
        <AccountForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar conta"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
