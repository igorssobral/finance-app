import { z } from "zod";

export const CARD_BRANDS = [
  { value: "VISA", label: "Visa" },
  { value: "MASTERCARD", label: "Mastercard" },
  { value: "ELO", label: "Elo" },
  { value: "AMEX", label: "American Express" },
  { value: "HIPERCARD", label: "Hipercard" },
  { value: "OTHER", label: "Outra" },
] as const;

export const cardSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60, "Nome muito longo"),
  brand: z.enum(["VISA", "MASTERCARD", "ELO", "AMEX", "HIPERCARD", "OTHER"], {
    required_error: "Selecione a bandeira",
  }),
  limit: z.coerce.number().positive("O limite deve ser maior que zero"),
  closingDay: z.coerce.number().int().min(1, "Dia inválido").max(31, "Dia inválido"),
  dueDay: z.coerce.number().int().min(1, "Dia inválido").max(31, "Dia inválido"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
});

export type CardInput = z.infer<typeof cardSchema>;
