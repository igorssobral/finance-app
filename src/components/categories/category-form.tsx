"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { ColorIconPicker } from "@/components/shared/color-icon-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryInput>;
  onSubmit: (data: CategoryInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { color: "#10b981", icon: "shapes", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" placeholder="Ex: Alimentação" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Cor e ícone</Label>
        <Controller
          control={control}
          name="color"
          render={({ field: colorField }) => (
            <Controller
              control={control}
              name="icon"
              render={({ field: iconField }) => (
                <ColorIconPicker
                  color={colorField.value}
                  icon={iconField.value}
                  onColorChange={colorField.onChange}
                  onIconChange={iconField.onChange}
                />
              )}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyBudget">Orçamento mensal (opcional)</Label>
        <Input
          id="monthlyBudget"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 1200,00"
          {...register("monthlyBudget")}
        />
        {errors.monthlyBudget && (
          <p className="text-xs text-destructive">{errors.monthlyBudget.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
