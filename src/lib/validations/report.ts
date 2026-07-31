import { z } from "zod";

export const REPORT_PERIODS = [
  { value: "MONTH", label: "Mês" },
  { value: "QUARTER", label: "Trimestre" },
  { value: "SEMESTER", label: "Semestre" },
  { value: "YEAR", label: "Ano" },
  { value: "CUSTOM", label: "Personalizado" },
] as const;

export const reportFiltersSchema = z
  .object({
    period: z.enum(["MONTH", "QUARTER", "SEMESTER", "YEAR", "CUSTOM"]).default("MONTH"),
    referenceDate: z.coerce.date().default(() => new Date()),
    customFrom: z.coerce.date().optional(),
    customTo: z.coerce.date().optional(),
  })
  .refine((data) => data.period !== "CUSTOM" || (data.customFrom && data.customTo), {
    message: "Selecione o período personalizado",
    path: ["customFrom"],
  });

export type ReportFilters = z.infer<typeof reportFiltersSchema>;
