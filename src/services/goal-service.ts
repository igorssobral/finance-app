import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createGoal as createGoalRepo,
  updateGoal as updateGoalRepo,
  deleteGoal as deleteGoalRepo,
  findGoalById,
} from "@/lib/repositories/goal-repository";
import type { GoalInput } from "@/lib/validations/goal";

function sanitizeInput(data: GoalInput): GoalInput {
  return { ...data, title: sanitizeText(data.title) };
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
      entity: "Goal",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createGoalWithAudit(userId: string, data: GoalInput) {
  const goal = await createGoalRepo(userId, sanitizeInput(data));
  await logAudit(userId, goal.id, "CREATE", undefined, goal);
  return goal;
}

export async function updateGoalWithAudit(userId: string, id: string, data: GoalInput) {
  const before = await findGoalById(userId, id);
  if (!before) throw new Error("Meta não encontrada");

  const goal = await updateGoalRepo(userId, id, sanitizeInput(data));
  await logAudit(userId, id, "UPDATE", before, goal);
  return goal;
}

export async function deleteGoalWithAudit(userId: string, id: string) {
  const before = await findGoalById(userId, id);
  if (!before) throw new Error("Meta não encontrada");

  await deleteGoalRepo(userId, id);
  await logAudit(userId, id, "DELETE", before);
}
