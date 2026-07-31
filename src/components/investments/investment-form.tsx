"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { investmentSchema, INVESTMENT_TYPES, type InvestmentInput } from "@/lib/validations/investment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface InvestmentFormProps {
  defaultValues?: Partial<InvestmentInput>;
  onSubmit: (data: InvestmentInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function InvestmentForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
}: InvestmentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { type: "CDB", purchaseDate: new Date(), ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do ativo</Label>
        <Input id="name" placeholder="Ex: Tesouro Selic 2029" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="broker">Corretora (opcional)</Label>
          <Input id="broker" placeholder="Ex: XP Investimentos" {...register("broker")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investedAmount">Valor investido</Label>
          <Input id="investedAmount" type="number" step="0.01" min="0" {...register("investedAmount")} />
          {errors.investedAmount && (
            <p className="text-xs text-destructive">{errors.investedAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Valor atual</Label>
          <Input id="currentAmount" type="number" step="0.01" min="0" {...register("currentAmount")} />
          {errors.currentAmount && (
            <p className="text-xs text-destructive">{errors.currentAmount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade (opcional)</Label>
          <Input id="quantity" type="number" step="0.00000001" min="0" {...register("quantity")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Data de compra</Label>
          <Input
            id="purchaseDate"
            type="date"
            {...register("purchaseDate", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
            defaultValue={
              defaultValues?.purchaseDate
                ? new Date(defaultValues.purchaseDate).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10)
            }
          />
          {errors.purchaseDate && <p className="text-xs text-destructive">Selecione uma data válida</p>}
        </div>
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
