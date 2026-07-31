import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { createInstallmentPurchase as createInstallmentPurchaseRepo } from "@/lib/repositories/installment-purchase-repository";
import { createRecurringSubscription as createRecurringSubscriptionRepo } from "@/lib/repositories/recurring-repository";
import type { InstallmentPurchaseInput } from "@/lib/validations/installment-purchase";
import type { RecurringSubscriptionInput } from "@/lib/validations/recurring-subscription";

export async function createInstallmentPurchaseWithAudit(userId: string, data: InstallmentPurchaseInput) {
  const sanitized = { ...data, title: sanitizeText(data.title) };
  const result = await createInstallmentPurchaseRepo(userId, sanitized);

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "Installment",
      entityId: result.installment.id,
      action: "CREATE",
      after: JSON.parse(JSON.stringify(result.installment)),
    },
  });

  return result;
}

export async function createRecurringSubscriptionWithAudit(
  userId: string,
  data: RecurringSubscriptionInput,
) {
  const sanitized = { ...data, name: sanitizeText(data.name) };
  const result = await createRecurringSubscriptionRepo(userId, sanitized);

  await prisma.auditLog.create({
    data: {
      userId,
      entity: "RecurringSubscription",
      entityId: result.subscription.id,
      action: "CREATE",
      after: JSON.parse(JSON.stringify(result.subscription)),
    },
  });

  return result;
}
