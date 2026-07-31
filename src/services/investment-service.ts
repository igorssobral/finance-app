import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createInvestment as createInvestmentRepo,
  updateInvestment as updateInvestmentRepo,
  deleteInvestment as deleteInvestmentRepo,
  findInvestmentById,
} from "@/lib/repositories/investment-repository";
import type { InvestmentInput } from "@/lib/validations/investment";

function sanitizeInput(data: InvestmentInput): InvestmentInput {
  return {
    ...data,
    name: sanitizeText(data.name),
    broker: data.broker ? sanitizeText(data.broker) : data.broker,
  };
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
      entity: "Investment",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createInvestmentWithAudit(userId: string, data: InvestmentInput) {
  const investment = await createInvestmentRepo(userId, sanitizeInput(data));
  await logAudit(userId, investment.id, "CREATE", undefined, investment);
  return investment;
}

export async function updateInvestmentWithAudit(userId: string, id: string, data: InvestmentInput) {
  const before = await findInvestmentById(userId, id);
  if (!before) throw new Error("Investimento não encontrado");

  const investment = await updateInvestmentRepo(userId, id, sanitizeInput(data));
  await logAudit(userId, id, "UPDATE", before, investment);
  return investment;
}

export async function deleteInvestmentWithAudit(userId: string, id: string) {
  const before = await findInvestmentById(userId, id);
  if (!before) throw new Error("Investimento não encontrado");

  await deleteInvestmentRepo(userId, id);
  await logAudit(userId, id, "DELETE", before);
}
