"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/categories/category-form";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import type { CategoryInput } from "@/lib/validations/category";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: { id: string; values: Partial<CategoryInput> } | null;
}

export function CategoryFormDialog({ open, onOpenChange, editing }: CategoryFormDialogProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEditing = !!editing;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(data: CategoryInput) {
    const result = isEditing
      ? await updateMutation.mutateAsync({ id: editing!.id, data })
      : await createMutation.mutateAsync(data);
    if (result.success) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados da categoria." : "Crie uma categoria personalizada."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={editing?.id ?? "new"}
          defaultValues={editing?.values}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={isEditing ? "Salvar alterações" : "Criar categoria"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
