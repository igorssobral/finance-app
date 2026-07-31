import { z } from "zod";

export const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Conta Poupança" },
  { value: "WALLET", label: "Carteira" },
  { value: "CASH", label: "Dinheiro" },
  { value: "DIGITAL", label: "Conta Digital" },
] as const;

export const accountSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(60, "Nome muito longo"),
  type: z.enum(["CHECKING", "SAVINGS", "WALLET", "CASH", "DIGITAL"], {
    required_error: "Selecione o tipo de conta",
  }),
  bank: z.string().max(60, "Nome do banco muito longo").optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  icon: z.string().min(1, "Selecione um ícone"),
  initialBalance: z.coerce.number({ invalid_type_error: "Informe um valor válido" }),
});

export type AccountInput = z.infer<typeof accountSchema>;
