"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { investmentSchema, type InvestmentInput } from "@/lib/validations/investment";
import { getInvestmentDashboard } from "@/lib/repositories/investment-repository";
import {
  createInvestmentWithAudit,
  updateInvestmentWithAudit,
  deleteInvestmentWithAudit,
} from "@/services/investment-service";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

async function requireWriteAccess() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  if (session.user.role === "GUEST") throw new Error("Convidados têm acesso somente leitura");
  return session.user.id;
}

export async function getInvestmentDashboardAction() {
  const userId = await requireUserId();
  return getInvestmentDashboard(userId);
}

export async function createInvestmentAction(input: InvestmentInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  await createInvestmentWithAudit(userId, parsed.data);
  revalidatePath("/investimentos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInvestmentAction(id: string, input: InvestmentInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    await updateInvestmentWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }
  revalidatePath("/investimentos");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInvestmentAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  try {
    await deleteInvestmentWithAudit(userId, id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }
  revalidatePath("/investimentos");
  revalidatePath("/dashboard");
  return { success: true };
}
