"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { goalSchema, type GoalInput } from "@/lib/validations/goal";
import { findGoals } from "@/lib/repositories/goal-repository";
import { createGoalWithAudit, updateGoalWithAudit, deleteGoalWithAudit } from "@/services/goal-service";

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

export async function listGoalsAction() {
  const userId = await requireUserId();
  return findGoals(userId);
}

export async function createGoalAction(input: GoalInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  await createGoalWithAudit(userId, parsed.data);
  revalidatePath("/metas");
  return { success: true };
}

export async function updateGoalAction(id: string, input: GoalInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  try {
    await updateGoalWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }
  revalidatePath("/metas");
  return { success: true };
}

export async function deleteGoalAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();
  try {
    await deleteGoalWithAudit(userId, id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }
  revalidatePath("/metas");
  return { success: true };
}
