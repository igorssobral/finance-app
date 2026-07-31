import { prisma } from "@/lib/prisma";
import type { RecurringSubscriptionInput } from "@/lib/validations/recurring-subscription";
import { addWeeks, addMonths, addQuarters, addYears } from "date-fns";

function getNextChargeDate(current: Date, frequency: RecurringSubscriptionInput["frequency"]): Date {
  switch (frequency) {
    case "WEEKLY":
      return addWeeks(current, 1);
    case "QUARTERLY":
      return addQuarters(current, 1);
    case "YEARLY":
      return addYears(current, 1);
    default:
      return addMonths(current, 1);
  }
}

/**
 * Cria a assinatura recorrente e já lança a primeira transação vinculada.
 * Cobranças futuras (2ª em diante) seriam geradas por um job agendado que lê
 * `RecurringSubscription.nextChargeDate` — fora do escopo desta etapa, que foca
 * na modelagem e no lançamento inicial.
 */
export async function createRecurringSubscription(userId: string, data: RecurringSubscriptionInput) {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.recurringSubscription.create({
      data: {
        userId,
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        nextChargeDate: getNextChargeDate(data.nextChargeDate, data.frequency),
        icon: data.icon,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        title: data.name,
        amount: data.amount,
        type: "EXPENSE",
        date: data.nextChargeDate,
        categoryId: data.categoryId || null,
        isRecurring: true,
        subscriptionId: subscription.id,
      },
    });

    return { subscription, transaction };
  });
}

export async function findRecurringSubscriptions(userId: string) {
  const subscriptions = await prisma.recurringSubscription.findMany({
    where: { userId },
    orderBy: { nextChargeDate: "asc" },
  });
  return subscriptions.map((s) => ({ ...s, amount: Number(s.amount) }));
}

export async function deactivateRecurringSubscription(userId: string, id: string) {
  return prisma.recurringSubscription.update({ where: { id, userId }, data: { active: false } });
}
