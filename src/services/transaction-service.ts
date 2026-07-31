import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createTransaction as createTransactionRepo,
  updateTransaction as updateTransactionRepo,
  deleteTransaction as deleteTransactionRepo,
  findTransactionById,
} from "@/lib/repositories/transaction-crud-repository";
import type { TransactionInput } from "@/lib/validations/transaction";

function sanitizeInput(data: TransactionInput): TransactionInput {
  return {
    ...data,
    title: sanitizeText(data.title),
    description: data.description ? sanitizeText(data.description) : data.description,
    notes: data.notes ? sanitizeText(data.notes) : data.notes,
  };
}

export async function createTransactionWithAudit(userId: string, data: TransactionInput) {
  const sanitized = sanitizeInput(data);
  const transaction = await createTransactionRepo(userId, sanitized);

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "Transaction",
      entityId: transaction.id,
      action: "CREATE",
      after: JSON.parse(JSON.stringify(transaction)),
    },
  });

  return transaction;
}

export async function updateTransactionWithAudit(userId: string, id: string, data: TransactionInput) {
  const before = await findTransactionById(userId, id);
  if (!before) throw new Error("Transação não encontrada");

  const sanitized = sanitizeInput(data);
  const transaction = await updateTransactionRepo(userId, id, sanitized);

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "Transaction",
      entityId: id,
      action: "UPDATE",
      before: JSON.parse(JSON.stringify(before)),
      after: JSON.parse(JSON.stringify(transaction)),
    },
  });

  return transaction;
}

export async function deleteTransactionWithAudit(userId: string, id: string) {
  const before = await findTransactionById(userId, id);
  if (!before) throw new Error("Transação não encontrada");

  await deleteTransactionRepo(userId, id);

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "Transaction",
      entityId: id,
      action: "DELETE",
      before: JSON.parse(JSON.stringify(before)),
    },
  });
}
