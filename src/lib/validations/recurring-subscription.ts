import { z } from "zod";

export const RECURRENCE_FREQUENCIES = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensal" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" },
] as const;

export const recurringSubscriptionSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80, "Nome muito longo"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"], {
    required_error: "Selecione a frequência",
  }),
  nextChargeDate: z.coerce.date({ required_error: "Selecione a próxima cobrança" }),
  categoryId: z.string().cuid().optional().or(z.literal("")),
  icon: z.string().default("repeat"),
});

export type RecurringSubscriptionInput = z.infer<typeof recurringSubscriptionSchema>;
