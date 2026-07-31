import { z } from "zod";

export const BUDGET_PERIODS = [
  { value: "MONTHLY", label: "Mensal" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "YEARLY", label: "Anual" },
] as const;

export const budgetSchema = z.object({
  categoryId: z.string().cuid("Selecione uma categoria"),
  limit: z.coerce.number().positive("O limite deve ser maior que zero"),
  period: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  alertAt: z.coerce.number().int().min(1).max(100).default(90),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
