"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReportFilters } from "@/lib/validations/report";
import { getReportDataAction } from "@/app/(dashboard)/relatorios/actions";

export function useReportQuery(filters: Partial<ReportFilters>) {
  return useQuery({
    queryKey: ["report", filters],
    queryFn: () => getReportDataAction(filters),
  });
}
