"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { cardSchema, CARD_BRANDS, type CardInput } from "@/lib/validations/card";
import { COLOR_PALETTE } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface CardFormProps {
  defaultValues?: Partial<CardInput>;
  onSubmit: (data: CardInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function CardForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
}: CardFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: { brand: "VISA", color: "#3b82f6", closingDay: 1, dueDay: 10, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do cartão</Label>
        <Input id="name" placeholder="Ex: Nubank Ultravioleta" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bandeira</Label>
          <Controller
            control={control}
            name="brand"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARD_BRANDS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit">Limite</Label>
          <Input id="limit" type="number" step="0.01" min="0" {...register("limit")} />
          {errors.limit && <p className="text-xs text-destructive">{errors.limit.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingDay">Dia de fechamento</Label>
          <Input id="closingDay" type="number" min="1" max="31" {...register("closingDay")} />
          {errors.closingDay && <p className="text-xs text-destructive">{errors.closingDay.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDay">Dia de vencimento</Label>
          <Input id="dueDay" type="number" min="1" max="31" {...register("dueDay")} />
          {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cor do cartão</Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => field.onChange(c)}
                  className={cn(
                    "size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                    field.value === c && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
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
