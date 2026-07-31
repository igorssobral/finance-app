import { prisma } from "@/lib/prisma";
import {
  createBudget as createBudgetRepo,
  updateBudget as updateBudgetRepo,
  deleteBudget as deleteBudgetRepo,
  findBudgetById,
} from "@/lib/repositories/budget-repository";
import type { BudgetInput } from "@/lib/validations/budget";

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
      entity: "Budget",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createBudgetWithAudit(userId: string, data: BudgetInput) {
  try {
    const budget = await createBudgetRepo(userId, data);
    await logAudit(userId, budget.id, "CREATE", undefined, budget);
    return budget;
  } catch {
    throw new Error("Já existe um orçamento para esta categoria neste período.");
  }
}

export async function updateBudgetWithAudit(userId: string, id: string, data: BudgetInput) {
  const before = await findBudgetById(userId, id);
  if (!before) throw new Error("Orçamento não encontrado");

  const budget = await updateBudgetRepo(userId, id, data);
  await logAudit(userId, id, "UPDATE", before, budget);
  return budget;
}

export async function deleteBudgetWithAudit(userId: string, id: string) {
  const before = await findBudgetById(userId, id);
  if (!before) throw new Error("Orçamento não encontrado");

  await deleteBudgetRepo(userId, id);
  await logAudit(userId, id, "DELETE", before);
}
