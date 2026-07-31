"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { accountSchema, ACCOUNT_TYPES, type AccountInput } from "@/lib/validations/account";
import { ColorIconPicker } from "@/components/shared/color-icon-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface AccountFormProps {
  defaultValues?: Partial<AccountInput>;
  onSubmit: (data: AccountInput) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function AccountForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
  isSubmitting = false,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      type: "CHECKING",
      color: "#10b981",
      icon: "landmark",
      initialBalance: 0,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" placeholder="Ex: Conta Principal" {...register("name")} />
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
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Banco (opcional)</Label>
          <Input id="bank" placeholder="Ex: Nubank" {...register("bank")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialBalance">Saldo inicial</Label>
        <Input id="initialBalance" type="number" step="0.01" {...register("initialBalance")} />
        {errors.initialBalance && (
          <p className="text-xs text-destructive">{errors.initialBalance.message}</p>
        )}
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
