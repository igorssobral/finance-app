"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  recurringSubscriptionSchema,
  RECURRENCE_FREQUENCIES,
  type RecurringSubscriptionInput,
} from "@/lib/validations/recurring-subscription";
import { useTransactionFormOptions, useCreateRecurringSubscription } from "@/hooks/use-transactions";
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

interface RecurringSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringSubscriptionDialog({ open, onOpenChange }: RecurringSubscriptionDialogProps) {
  const { data: options } = useTransactionFormOptions();
  const mutation = useCreateRecurringSubscription();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RecurringSubscriptionInput>({
    resolver: zodResolver(recurringSubscriptionSchema),
    defaultValues: { frequency: "MONTHLY", nextChargeDate: new Date(), icon: "tv" },
  });

  async function onSubmit(data: RecurringSubscriptionInput) {
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
          <DialogTitle>Nova assinatura recorrente</DialogTitle>
          <DialogDescription>
            Ex: Netflix, Spotify. A primeira cobrança é lançada imediatamente como transação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da assinatura</Label>
            <Input id="name" placeholder="Ex: Netflix" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_FREQUENCIES.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
            <Label htmlFor="nextChargeDate">Próxima cobrança</Label>
            <Input
              id="nextChargeDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              {...register("nextChargeDate", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              Criar assinatura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
