"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { budgetSchema, BUDGET_PERIODS, type BudgetInput } from "@/lib/validations/budget";
import { useCategoriesQuery } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface BudgetFormProps {
  defaultValues?: Partial<BudgetInput>;
  onSubmit: (data: BudgetInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Ao editar, a categoria já está definida e não pode ser trocada (evita duplicidade). */
  lockCategory?: boolean;
}

export function BudgetForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
  lockCategory = false,
}: BudgetFormProps) {
  const { data: categories } = useCategoriesQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { period: "MONTHLY", alertAt: 90, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={lockCategory}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="limit">Limite</Label>
          <Input id="limit" type="number" step="0.01" min="0" placeholder="Ex: 1200,00" {...register("limit")} />
          {errors.limit && <p className="text-xs text-destructive">{errors.limit.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUDGET_PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="alertAt">Alertar ao atingir (%)</Label>
        <Input id="alertAt" type="number" min="1" max="100" {...register("alertAt")} />
        <p className="text-xs text-muted-foreground">
          Você recebe um aviso quando o gasto atingir essa porcentagem do limite.
        </p>
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
