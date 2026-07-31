import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createAccount as createAccountRepo,
  updateAccount as updateAccountRepo,
  deleteAccount as deleteAccountRepo,
  archiveAccount,
  findAccountById,
} from "@/lib/repositories/account-crud-repository";
import type { AccountInput } from "@/lib/validations/account";

function sanitizeInput(data: AccountInput): AccountInput {
  return { ...data, name: sanitizeText(data.name), bank: data.bank ? sanitizeText(data.bank) : data.bank };
}

async function logAudit(
  userId: string,
  entityId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  before?: unknown,
  after?: unknown,
) {
  await prisma.auditLog.create({
    data: {
      userId,
      entity: "Account",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createAccountWithAudit(userId: string, data: AccountInput) {
  const account = await createAccountRepo(userId, sanitizeInput(data));
  await logAudit(userId, account.id, "CREATE", undefined, account);
  return account;
}

export async function updateAccountWithAudit(userId: string, id: string, data: AccountInput) {
  const before = await findAccountById(userId, id);
  if (!before) throw new Error("Conta não encontrada");

  const account = await updateAccountRepo(userId, id, sanitizeInput(data));
  await logAudit(userId, id, "UPDATE", before, account);
  return account;
}

/**
 * Se a conta tem transações vinculadas, arquiva em vez de excluir — preserva o
 * histórico e mantém os relatórios corretos. Só exclui de fato contas "vazias".
 */
export async function deleteOrArchiveAccount(userId: string, id: string) {
  const before = await findAccountById(userId, id);
  if (!before) throw new Error("Conta não encontrada");

  const transactionCount = await prisma.transaction.count({ where: { accountId: id, userId } });

  if (transactionCount > 0) {
    await archiveAccount(userId, id);
    await logAudit(userId, id, "UPDATE", before, { ...before, archived: true });
    return { archived: true };
  }

  await deleteAccountRepo(userId, id);
  await logAudit(userId, id, "DELETE", before);
  return { archived: false };
}
