"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";
import { updateProfileWithAudit, changePasswordWithAudit } from "@/services/profile-service";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function getProfileAction() {
  const userId = await requireUserId();
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true, currency: true, locale: true, timezone: true },
  });
}

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await updateProfileWithAudit(userId, parsed.data);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePasswordAction(input: ChangePasswordInput): Promise<ActionResult> {
  const userId = await requireUserId();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await changePasswordWithAudit(userId, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao trocar senha" };
  }

  return { success: true };
}
