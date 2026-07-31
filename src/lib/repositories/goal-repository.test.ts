import { describe, it, expect } from "vitest";
import { subMonths } from "date-fns";
import { estimateCompletion } from "@/lib/repositories/goal-repository";

describe("estimateCompletion", () => {
  it("não estima nada quando o valor atual é zero", () => {
    const result = estimateCompletion(0, 10000, subMonths(new Date(), 3));
    expect(result.estimatedCompletionDate).toBeNull();
    expect(result.monthsRemaining).toBeNull();
  });

  it("não estima nada quando a meta já foi atingida", () => {
    const result = estimateCompletion(10000, 10000, subMonths(new Date(), 3));
    expect(result.estimatedCompletionDate).toBeNull();
  });

  it("projeta uma data futura quando há progresso parcial", () => {
    // guardou 3000 em 3 meses (1000/mês) rumo a uma meta de 10000
    const result = estimateCompletion(3000, 10000, subMonths(new Date(), 3));
    expect(result.estimatedCompletionDate).not.toBeNull();
    expect(result.monthsRemaining).toBeGreaterThan(0);
    // faltam 7000 a 1000/mês => ~7 meses
    expect(result.monthsRemaining).toBe(7);
  });

  it("projeta menos meses restantes quando o ritmo de aporte é mais rápido", () => {
    // guardou 8000 em 2 meses (4000/mês) rumo a uma meta de 10000
    const result = estimateCompletion(8000, 10000, subMonths(new Date(), 2));
    expect(result.monthsRemaining).toBe(1);
  });
});
