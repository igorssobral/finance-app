"use server";

import { auth } from "@/lib/auth";
import { reportFiltersSchema, type ReportFilters } from "@/lib/validations/report";
import { getReportData } from "@/services/report-service";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function getReportDataAction(rawFilters: Partial<ReportFilters>) {
  const userId = await requireUserId();
  const filters = reportFiltersSchema.parse(rawFilters);
  return getReportData(userId, filters);
}
