"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { accountSchema, type AccountInput } from "@/lib/validations/account";
import { findAccounts, getAccountBalance } from "@/lib/repositories/account-crud-repository";
import {
  createAccountWithAudit,
  updateAccountWithAudit,
  deleteOrArchiveAccount,
} from "@/services/account-service";

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

export async function listAccountsAction() {
  const userId = await requireUserId();
  const accounts = await findAccounts(userId);
  const withBalance = await Promise.all(
    accounts.map(async (account) => ({
      ...account,
      currentBalance: await getAccountBalance(userId, account.id),
    })),
  );
  return withBalance;
}

export async function createAccountAction(input: AccountInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createAccountWithAudit(userId, parsed.data);
  revalidatePath("/contas");
  return { success: true };
}

export async function updateAccountAction(id: string, input: AccountInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await updateAccountWithAudit(userId, id, parsed.data);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar" };
  }

  revalidatePath("/contas");
  return { success: true };
}

export async function deleteAccountAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  try {
    const result = await deleteOrArchiveAccount(userId, id);
    revalidatePath("/contas");
    return { success: true, archived: result.archived };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao excluir" };
  }
}
