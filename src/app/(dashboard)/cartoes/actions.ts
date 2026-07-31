"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { cardSchema, type CardInput } from "@/lib/validations/card";
import { findCardsWithAvailableLimit, getCardDetail } from "@/lib/repositories/card-repository";
import { createCardWithAudit, updateCardWithAudit, deleteOrArchiveCard } from "@/services/card-service";

type ActionResult =
  | { success: true; archived?: boolean }
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

export async function listCardsAction() {
  const userId = await requireUserId();
  return findCardsWithAvailableLimit(userId);
}

export async function getCardDetailAction(cardId: string) {
  const userId = await requireUserId();
  return getCardDetail(userId, cardId);
}

export async function createCardAction(input: CardInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = cardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createCardWithAudit(userId, parsed.data);
  revalidatePath("/cartoes");
  return { success: true };
}

export async function updateCardAction(id: string, input: CardInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = cardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await updateCardWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }

  revalidatePath("/cartoes");
  return { success: true };
}

export async function deleteCardAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  try {
    const result = await deleteOrArchiveCard(userId, id);
    revalidatePath("/cartoes");
    return { success: true, archived: result.archived };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }
}
