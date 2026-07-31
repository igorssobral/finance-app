import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60, "Nome muito longo"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().min(1, "Selecione um ícone"),
  monthlyBudget: z.coerce
    .number()
    .positive("O orçamento deve ser maior que zero")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type CategoryInput = z.infer<typeof categorySchema>;
