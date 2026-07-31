import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formata um valor positivo em BRL por padrão", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
  });

  it("aceita outra moeda e locale", () => {
    const result = formatCurrency(1234.5, "USD", "en-US");
    expect(result).toContain("1,234.50");
  });

  it("formata zero corretamente", () => {
    expect(formatCurrency(0)).toContain("0,00");
  });

  it("formata valores negativos com sinal", () => {
    expect(formatCurrency(-50)).toContain("50,00");
    expect(formatCurrency(-50)).toMatch(/-/);
  });
});

describe("formatPercent", () => {
  it("adiciona sinal de + para valores positivos", () => {
    expect(formatPercent(12.345)).toBe("+12.3%");
  });

  it("não adiciona sinal extra para valores negativos", () => {
    expect(formatPercent(-8.2)).toBe("-8.2%");
  });

  it("respeita o número de casas decimais informado", () => {
    expect(formatPercent(12.345, 0)).toBe("+12%");
    expect(formatPercent(12.345, 2)).toBe("+12.35%");
  });

  it("trata zero sem sinal de +", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("cn", () => {
  it("mescla classes e resolve conflitos do Tailwind (última classe vence)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});
