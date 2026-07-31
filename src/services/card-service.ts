import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createCard as createCardRepo,
  updateCard as updateCardRepo,
  deleteCard as deleteCardRepo,
  archiveCard,
  findCardById,
} from "@/lib/repositories/card-repository";
import type { CardInput } from "@/lib/validations/card";

function sanitizeInput(data: CardInput): CardInput {
  return { ...data, name: sanitizeText(data.name) };
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
      entity: "Card",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createCardWithAudit(userId: string, data: CardInput) {
  const card = await createCardRepo(userId, sanitizeInput(data));
  await logAudit(userId, card.id, "CREATE", undefined, card);
  return card;
}

export async function updateCardWithAudit(userId: string, id: string, data: CardInput) {
  const before = await findCardById(userId, id);
  if (!before) throw new Error("Cartão não encontrado");

  const card = await updateCardRepo(userId, id, sanitizeInput(data));
  await logAudit(userId, id, "UPDATE", before, card);
  return card;
}

/** Mesma regra das contas: arquiva se houver transações/parcelamentos vinculados. */
export async function deleteOrArchiveCard(userId: string, id: string) {
  const before = await findCardById(userId, id);
  if (!before) throw new Error("Cartão não encontrado");

  const [transactionCount, installmentCount] = await Promise.all([
    prisma.transaction.count({ where: { cardId: id } }),
    prisma.installment.count({ where: { cardId: id } }),
  ]);

  if (transactionCount > 0 || installmentCount > 0) {
    await archiveCard(userId, id);
    await logAudit(userId, id, "UPDATE", before, { ...before, archived: true });
    return { archived: true };
  }

  await deleteCardRepo(userId, id);
  await logAudit(userId, id, "DELETE", before);
  return { archived: false };
}
