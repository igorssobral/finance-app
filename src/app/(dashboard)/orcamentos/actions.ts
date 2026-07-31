"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { budgetSchema, type BudgetInput } from "@/lib/validations/budget";
import { findBudgets } from "@/lib/repositories/budget-repository";
import {
  createBudgetWithAudit,
  updateBudgetWithAudit,
  deleteBudgetWithAudit,
} from "@/services/budget-service";

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

export async function listBudgetsAction() {
  const userId = await requireUserId();
  return findBudgets(userId);
}

export async function createBudgetAction(input: BudgetInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    await createBudgetWithAudit(userId, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao criar" };
  }
  revalidatePath("/orcamentos");
  return { success: true };
}

export async function updateBudgetAction(id: string, input: BudgetInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    await updateBudgetWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }
  revalidatePath("/orcamentos");
  return { success: true };
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  try {
    await deleteBudgetWithAudit(userId, id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }
  revalidatePath("/orcamentos");
  return { success: true };
}
