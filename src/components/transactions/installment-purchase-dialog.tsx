"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  installmentPurchaseSchema,
  type InstallmentPurchaseInput,
} from "@/lib/validations/installment-purchase";
import { useTransactionFormOptions, useCreateInstallmentPurchase } from "@/hooks/use-transactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface InstallmentPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallmentPurchaseDialog({ open, onOpenChange }: InstallmentPurchaseDialogProps) {
  const { data: options } = useTransactionFormOptions();
  const mutation = useCreateInstallmentPurchase();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<InstallmentPurchaseInput>({
    resolver: zodResolver(installmentPurchaseSchema),
    defaultValues: { totalCount: 12, firstDueDate: new Date() },
  });

  const totalAmount = watch("totalAmount");
  const totalCount = watch("totalCount");
  const installmentPreview =
    totalAmount && totalCount ? (Number(totalAmount) / Number(totalCount)).toFixed(2) : null;

  async function onSubmit(data: InstallmentPurchaseInput) {
    const result = await mutation.mutateAsync(data);
    if (result.success) {
      reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova compra parcelada</DialogTitle>
          <DialogDescription>
            As parcelas são lançadas automaticamente, uma por mês, a partir da primeira data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Descrição da compra</Label>
            <Input id="title" placeholder="Ex: Notebook" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Valor total</Label>
              <Input id="totalAmount" type="number" step="0.01" min="0" {...register("totalAmount")} />
              {errors.totalAmount && (
                <p className="text-xs text-destructive">{errors.totalAmount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCount">Número de parcelas</Label>
              <Input id="totalCount" type="number" min="2" max="60" {...register("totalCount")} />
              {errors.totalCount && (
                <p className="text-xs text-destructive">{errors.totalCount.message}</p>
              )}
            </div>
          </div>

          {installmentPreview && (
            <p className="text-xs text-muted-foreground">
              {totalCount}x de R$ {installmentPreview}
            </p>
          )}

          <div className="space-y-2">
            <Label>Cartão</Label>
            <Controller
              control={control}
              name="cardId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cartão" /></SelectTrigger>
                  <SelectContent>
                    {options?.cards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.cardId && <p className="text-xs text-destructive">{errors.cardId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria (opcional)</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value || "NONE"} onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Sem categoria</SelectItem>
                    {options?.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstDueDate">Data da primeira parcela</Label>
            <Input
              id="firstDueDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              {...register("firstDueDate", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Criar parcelamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
