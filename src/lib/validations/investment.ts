import { z } from "zod";

export const INVESTMENT_TYPES = [
  { value: "TREASURY", label: "Tesouro Direto" },
  { value: "CDB", label: "CDB" },
  { value: "STOCK", label: "Ações" },
  { value: "ETF", label: "ETFs" },
  { value: "REIT", label: "FIIs" },
  { value: "CRYPTO", label: "Criptomoedas" },
  { value: "FUND", label: "Fundos" },
] as const;

export const investmentSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80, "Nome muito longo"),
  type: z.enum(["TREASURY", "CDB", "STOCK", "ETF", "REIT", "CRYPTO", "FUND"], {
    required_error: "Selecione o tipo",
  }),
  investedAmount: z.coerce.number().positive("O valor investido deve ser maior que zero"),
  currentAmount: z.coerce.number().positive("O valor atual deve ser maior que zero"),
  quantity: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  broker: z.string().max(60, "Nome muito longo").optional().or(z.literal("")),
  purchaseDate: z.coerce.date({ required_error: "Selecione a data de compra" }),
});

export type InvestmentInput = z.infer<typeof investmentSchema>;
