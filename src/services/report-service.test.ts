import { describe, it, expect } from "vitest";
import { resolveReportRange } from "@/services/report-service";
import type { ReportFilters } from "@/lib/validations/report";

function filters(overrides: Partial<ReportFilters>): ReportFilters {
  return {
    period: "MONTH",
    referenceDate: new Date("2026-03-15"),
    ...overrides,
  } as ReportFilters;
}

describe("resolveReportRange", () => {
  it("resolve o mês inteiro para period=MONTH", () => {
    const { start, end } = resolveReportRange(filters({ period: "MONTH" }));
    expect(start.getMonth()).toBe(2); // março (0-indexed)
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(2);
    expect(end.getDate()).toBe(31);
  });

  it("resolve o trimestre inteiro para period=QUARTER", () => {
    const { start, end } = resolveReportRange(filters({ period: "QUARTER" }));
    // março está no Q1 (jan-mar)
    expect(start.getMonth()).toBe(0);
    expect(end.getMonth()).toBe(2);
  });

  it("resolve o primeiro semestre corretamente", () => {
    const { start, end } = resolveReportRange(filters({ period: "SEMESTER", referenceDate: new Date("2026-03-15") }));
    expect(start.getMonth()).toBe(0);
    expect(end.getMonth()).toBe(5);
  });

  it("resolve o segundo semestre corretamente", () => {
    const { start, end } = resolveReportRange(filters({ period: "SEMESTER", referenceDate: new Date("2026-09-15") }));
    expect(start.getMonth()).toBe(6);
    expect(end.getMonth()).toBe(11);
  });

  it("resolve o ano inteiro para period=YEAR", () => {
    const { start, end } = resolveReportRange(filters({ period: "YEAR" }));
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it("usa customFrom/customTo para period=CUSTOM", () => {
    const customFrom = new Date("2026-05-01");
    const customTo = new Date("2026-05-20");
    const { start, end } = resolveReportRange(filters({ period: "CUSTOM", customFrom, customTo }));
    expect(start).toEqual(customFrom);
    expect(end).toEqual(customTo);
  });
});
