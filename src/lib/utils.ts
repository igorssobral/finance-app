import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata valores monetários respeitando moeda/locale do usuário. */
export function formatCurrency(
  value: number,
  currency: string = "BRL",
  locale: string = "pt-BR",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/** Formata variação percentual com sinal (+/-). */
export function formatPercent(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}
