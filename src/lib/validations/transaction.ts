import { z } from "zod";

export const transactionSchema = z.object({
  title: z
    .string()
    .min(2, "Título deve ter ao menos 2 caracteres")
    .max(120, "Título muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional().or(z.literal("")),
  amount: z.coerce
    .number({ invalid_type_error: "Informe um valor válido" })
    .positive("O valor deve ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"], { required_error: "Selecione o tipo" }),
  date: z.coerce.date({ required_error: "Selecione a data" }),
  categoryId: z.string().cuid().optional().or(z.literal("")),
  accountId: z.string().cuid().optional().or(z.literal("")),
  cardId: z.string().cuid().optional().or(z.literal("")),
  isRecurring: z.boolean().default(false),
  isInstallment: z.boolean().default(false),
  notes: z.string().max(1000, "Observações muito longas").optional().or(z.literal("")),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const transactionFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  cardId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  onlyRecurring: z.boolean().optional(),
  onlyInstallment: z.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
