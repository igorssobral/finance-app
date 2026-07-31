"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { goalSchema, type GoalInput } from "@/lib/validations/goal";
import { ColorIconPicker } from "@/components/shared/color-icon-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalFormProps {
  defaultValues?: Partial<GoalInput>;
  onSubmit: (data: GoalInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function GoalForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
}: GoalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: { color: "#10b981", icon: "target", currentAmount: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título da meta</Label>
        <Input id="title" placeholder="Ex: Comprar carro" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Valor da meta</Label>
          <Input id="targetAmount" type="number" step="0.01" min="0" {...register("targetAmount")} />
          {errors.targetAmount && (
            <p className="text-xs text-destructive">{errors.targetAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Valor já guardado</Label>
          <Input id="currentAmount" type="number" step="0.01" min="0" {...register("currentAmount")} />
          {errors.currentAmount && (
            <p className="text-xs text-destructive">{errors.currentAmount.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDate">Data alvo (opcional)</Label>
        <Input
          id="targetDate"
          type="date"
          {...register("targetDate", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
          defaultValue={
            defaultValues?.targetDate ? new Date(defaultValues.targetDate).toISOString().slice(0, 10) : ""
          }
        />
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
