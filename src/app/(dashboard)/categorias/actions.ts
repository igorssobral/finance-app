"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { findCategories } from "@/lib/repositories/category-repository";
import {
  createCategoryWithAudit,
  updateCategoryWithAudit,
  deleteCategoryWithAudit,
} from "@/services/category-service";

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

export async function listCategoriesAction() {
  const userId = await requireUserId();
  return findCategories(userId);
}

export async function createCategoryAction(input: CategoryInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createCategoryWithAudit(userId, parsed.data);
  revalidatePath("/categorias");
  return { success: true };
}

export async function updateCategoryAction(id: string, input: CategoryInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await updateCategoryWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }

  revalidatePath("/categorias");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  try {
    await deleteCategoryWithAudit(userId, id);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }

  revalidatePath("/categorias");
  return { success: true };
}
