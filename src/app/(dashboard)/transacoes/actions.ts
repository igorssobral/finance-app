"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { transactionSchema, transactionFiltersSchema, type TransactionInput, type TransactionFilters } from "@/lib/validations/transaction";
import {
  createTransactionWithAudit,
  updateTransactionWithAudit,
  deleteTransactionWithAudit,
} from "@/services/transaction-service";
import { findTransactions, getTransactionFormOptions } from "@/lib/repositories/transaction-crud-repository";
import {
  installmentPurchaseSchema,
  type InstallmentPurchaseInput,
} from "@/lib/validations/installment-purchase";
import {
  recurringSubscriptionSchema,
  type RecurringSubscriptionInput,
} from "@/lib/validations/recurring-subscription";
import {
  createInstallmentPurchaseWithAudit,
  createRecurringSubscriptionWithAudit,
} from "@/services/recurrence-service";

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

export async function listTransactionsAction(rawFilters: Partial<TransactionFilters>) {
  const userId = await requireUserId();
  const filters = transactionFiltersSchema.parse(rawFilters);
  return findTransactions(userId, filters);
}

export async function getTransactionFormOptionsAction() {
  const userId = await requireUserId();
  return getTransactionFormOptions(userId);
}

export async function createTransactionAction(input: TransactionInput): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createTransactionWithAudit(userId, parsed.data);
  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTransactionAction(
  id: string,
  input: TransactionInput,
): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await updateTransactionWithAudit(userId, id, parsed.data);
  } catch {
    return { success: false, error: "Transação não encontrada" };
  }

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  try {
    await deleteTransactionWithAudit(userId, id);
  } catch {
    return { success: false, error: "Transação não encontrada" };
  }

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createInstallmentPurchaseAction(
  input: InstallmentPurchaseInput,
): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = installmentPurchaseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createInstallmentPurchaseWithAudit(userId, parsed.data);
  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  revalidatePath("/cartoes");
  return { success: true };
}

export async function createRecurringSubscriptionAction(
  input: RecurringSubscriptionInput,
): Promise<ActionResult> {
  const userId = await requireWriteAccess();

  const parsed = recurringSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await createRecurringSubscriptionWithAudit(userId, parsed.data);
  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true };
}
