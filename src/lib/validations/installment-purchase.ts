import { z } from "zod";

export const installmentPurchaseSchema = z.object({
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres").max(120, "Título muito longo"),
  totalAmount: z.coerce.number().positive("O valor total deve ser maior que zero"),
  totalCount: z.coerce.number().int().min(2, "Parcelamento precisa de ao menos 2 parcelas").max(60, "Máximo de 60 parcelas"),
  firstDueDate: z.coerce.date({ required_error: "Selecione a data da primeira parcela" }),
  cardId: z.string().cuid("Selecione um cartão"),
  categoryId: z.string().cuid().optional().or(z.literal("")),
});

export type InstallmentPurchaseInput = z.infer<typeof installmentPurchaseSchema>;
