import { z } from "zod";

export const goalSchema = z.object({
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres").max(80, "Título muito longo"),
  targetAmount: z.coerce.number().positive("A meta deve ser maior que zero"),
  currentAmount: z.coerce.number().min(0, "O valor atual não pode ser negativo").default(0),
  targetDate: z.coerce.date().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().min(1, "Selecione um ícone"),
});

export type GoalInput = z.infer<typeof goalSchema>;
