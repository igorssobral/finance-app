import { z } from "zod";

export const CURRENCIES = [
  { value: "BRL", label: "Real (R$)" },
  { value: "USD", label: "Dólar (US$)" },
  { value: "EUR", label: "Euro (€)" },
] as const;

export const LOCALES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
] as const;

export const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/New_York", label: "New York (GMT-5/-4)" },
] as const;

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80, "Nome muito longo"),
  image: z.string().url("URL inválida").optional().or(z.literal("")),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  locale: z.enum(["pt-BR", "en-US"]).default("pt-BR"),
  timezone: z.string().default("America/Sao_Paulo"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
