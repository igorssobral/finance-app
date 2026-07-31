"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { useTransactionFormOptions } from "@/hooks/use-transactions";
import { suggestCategoryAction } from "@/app/(dashboard)/transacoes/ai-actions";
import { ReceiptScanButton } from "@/components/transactions/receipt-scan-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TransactionFormProps {
  defaultValues?: Partial<TransactionInput>;
  onSubmit: (data: TransactionInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  /** Mostra os atalhos de IA (escanear comprovante e sugerir categoria) — só faz sentido ao criar. */
  showAiShortcuts?: boolean;
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
  showAiShortcuts = false,
}: TransactionFormProps) {
  const { data: options } = useTransactionFormOptions();
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date(),
      isRecurring: false,
      isInstallment: false,
      ...defaultValues,
    },
  });

  const type = watch("type");
  const title = watch("title");
  const description = watch("description");

  async function handleSuggestCategory() {
    if (!title || title.length < 2) {
      toast.warning("Digite um título antes de pedir a sugestão");
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestCategoryAction(title, description ?? "");
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data.categoryId) {
        toast.warning("Nenhuma categoria correspondente encontrada");
        return;
      }
      setValue("categoryId", result.data.categoryId);
      toast.success(`Categoria sugerida: ${result.data.categoryName}`);
    } finally {
      setIsSuggesting(false);
    }
  }

  function handleReceiptExtracted(data: { title: string | null; amount: number | null; date: string | null }) {
    if (data.title) setValue("title", data.title);
    if (data.amount) setValue("amount", data.amount);
    if (data.date) setValue("date", new Date(data.date));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {showAiShortcuts && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
          <ReceiptScanButton onExtracted={handleReceiptExtracted} />
          <span className="text-xs text-muted-foreground">
            ou preencha manualmente abaixo
          </span>
        </div>
      )}

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="EXPENSE">Despesa</TabsTrigger>
              <TabsTrigger value="INCOME">Receita</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" placeholder="Ex: Supermercado" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input id="amount" type="number" step="0.01" min="0" placeholder="0,00" {...register("amount")} />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            {...register("date", {
              setValueAs: (v) => (v ? new Date(v) : undefined),
            })}
            defaultValue={
              defaultValues?.date
                ? new Date(defaultValues.date).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10)
            }
          />
          {errors.date && <p className="text-xs text-destructive">Selecione uma data válida</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" placeholder="Opcional" {...register("description")} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categoria</Label>
            {showAiShortcuts && (
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={isSuggesting}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                {isSuggesting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Sugerir
              </button>
            )}
          </div>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value || "NONE"} onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sem categoria</SelectItem>
                  {options?.categories
                    .filter((c) => type === "EXPENSE" || c.name.match(/salário|freelance|investimentos/i))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Conta</Label>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value || "NONE"} onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Nenhuma</SelectItem>
                  {options?.accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {type === "EXPENSE" && (
          <div className="space-y-2">
            <Label>Cartão</Label>
            <Controller
              control={control}
              name="cardId"
              render={({ field }) => (
                <Select value={field.value || "NONE"} onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhum</SelectItem>
                    {options?.cards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Input id="notes" placeholder="Opcional" {...register("notes")} />
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="isRecurring"
            render={({ field }) => (
              <Checkbox id="isRecurring" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="isRecurring" className="font-normal">Recorrente</Label>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="isInstallment"
            render={({ field }) => (
              <Checkbox id="isInstallment" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="isInstallment" className="font-normal">Parcelada</Label>
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
