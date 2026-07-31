import { prisma } from "@/lib/prisma";
import { addMonths } from "date-fns";
import type { InstallmentPurchaseInput } from "@/lib/validations/installment-purchase";

/**
 * Cria o registro de Installment e gera automaticamente as N transações mensais
 * vinculadas a ele (uma por parcela), todas já marcadas como `isInstallment`.
 * Tudo em uma única transação de banco — ou cria tudo, ou nada.
 */
export async function createInstallmentPurchase(userId: string, data: InstallmentPurchaseInput) {
  const installmentAmount = Number((data.totalAmount / data.totalCount).toFixed(2));

  return prisma.$transaction(async (tx) => {
    const installment = await tx.installment.create({
      data: {
        cardId: data.cardId,
        title: data.title,
        totalAmount: data.totalAmount,
        totalCount: data.totalCount,
        paidCount: 0,
        installmentAmount,
        firstDueDate: data.firstDueDate,
      },
    });

    const transactions = await Promise.all(
      Array.from({ length: data.totalCount }).map((_, index) =>
        tx.transaction.create({
          data: {
            userId,
            title: `${data.title} (${index + 1}/${data.totalCount})`,
            amount: installmentAmount,
            type: "EXPENSE",
            date: addMonths(data.firstDueDate, index),
            categoryId: data.categoryId || null,
            cardId: data.cardId,
            isInstallment: true,
            installmentId: installment.id,
          },
        }),
      ),
    );

    return { installment, transactions };
  });
}
