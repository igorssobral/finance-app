import { prisma } from "@/lib/prisma";
import { differenceInCalendarMonths, addMonths } from "date-fns";
import type { GoalInput } from "@/lib/validations/goal";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export interface GoalWithProgress {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  status: "IN_PROGRESS" | "ACHIEVED" | "ARCHIVED";
  color: string;
  icon: string;
  percent: number;
  /** Previsão de conclusão com base no ritmo médio de aportes dos últimos 3 meses. */
  estimatedCompletionDate: Date | null;
  monthsRemaining: number | null;
}

/**
 * Estima quando a meta será concluída assumindo que o ritmo de aporte se mantém.
 * Como o modelo não guarda histórico de aportes, usamos uma aproximação simples:
 * tempo decorrido desde a criação da meta vs. progresso atual.
 */
export function estimateCompletion(
  currentAmount: number,
  targetAmount: number,
  createdAt: Date,
): { estimatedCompletionDate: Date | null; monthsRemaining: number | null } {
  if (currentAmount <= 0 || currentAmount >= targetAmount) {
    return { estimatedCompletionDate: null, monthsRemaining: null };
  }

  const monthsElapsed = Math.max(1, differenceInCalendarMonths(new Date(), createdAt));
  const averageMonthlyContribution = currentAmount / monthsElapsed;
  if (averageMonthlyContribution <= 0) {
    return { estimatedCompletionDate: null, monthsRemaining: null };
  }

  const remaining = targetAmount - currentAmount;
  const monthsRemaining = Math.ceil(remaining / averageMonthlyContribution);

  return {
    estimatedCompletionDate: addMonths(new Date(), monthsRemaining),
    monthsRemaining,
  };
}

export async function findGoals(userId: string): Promise<GoalWithProgress[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => {
    const targetAmount = toNumber(g.targetAmount);
    const currentAmount = toNumber(g.currentAmount);
    const percent = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;
    const { estimatedCompletionDate, monthsRemaining } = estimateCompletion(
      currentAmount,
      targetAmount,
      g.createdAt,
    );

    return {
      id: g.id,
      title: g.title,
      targetAmount,
      currentAmount,
      targetDate: g.targetDate,
      status: g.status,
      color: g.color,
      icon: g.icon,
      percent,
      estimatedCompletionDate,
      monthsRemaining,
    };
  });
}

export async function createGoal(userId: string, data: GoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate ?? null,
      color: data.color,
      icon: data.icon,
    },
  });
}

export async function updateGoal(userId: string, id: string, data: GoalInput) {
  const status = data.currentAmount >= data.targetAmount ? "ACHIEVED" : "IN_PROGRESS";
  return prisma.goal.update({
    where: { id, userId },
    data: {
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate ?? null,
      color: data.color,
      icon: data.icon,
      status,
    },
  });
}

export async function deleteGoal(userId: string, id: string) {
  return prisma.goal.delete({ where: { id, userId } });
}

export async function findGoalById(userId: string, id: string) {
  const goal = await prisma.goal.findUnique({ where: { id, userId } });
  if (!goal) return null;
  return { ...goal, targetAmount: toNumber(goal.targetAmount), currentAmount: toNumber(goal.currentAmount) };
}
