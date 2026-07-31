import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { CardInput } from "@/lib/validations/card";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function findCards(userId: string, includeArchived = false) {
  const cards = await prisma.card.findMany({
    where: { userId, ...(includeArchived ? {} : { archived: false }) },
    orderBy: { name: "asc" },
  });

  return cards.map((c) => ({ ...c, limit: Number(c.limit) }));
}

/** Lista de cartões já com o limite disponível calculado (para os tiles da listagem). */
export async function findCardsWithAvailableLimit(userId: string, reference = new Date()) {
  const cards = await findCards(userId);

  return Promise.all(
    cards.map(async (card) => {
      const { periodStart, periodEnd } = getCurrentInvoicePeriod(card.closingDay, reference);
      const openInvoice = await prisma.transaction.aggregate({
        where: { cardId: card.id, date: { gt: periodStart, lte: periodEnd } },
        _sum: { amount: true },
      });
      const openTotal = toNumber(openInvoice._sum.amount);
      return { ...card, availableLimit: card.limit - openTotal };
    }),
  );
}

export async function createCard(userId: string, data: CardInput) {
  return prisma.card.create({
    data: {
      userId,
      name: data.name,
      brand: data.brand,
      limit: data.limit,
      closingDay: data.closingDay,
      dueDay: data.dueDay,
      color: data.color,
    },
  });
}

export async function updateCard(userId: string, id: string, data: CardInput) {
  return prisma.card.update({
    where: { id, userId },
    data: {
      name: data.name,
      brand: data.brand,
      limit: data.limit,
      closingDay: data.closingDay,
      dueDay: data.dueDay,
      color: data.color,
    },
  });
}

export async function archiveCard(userId: string, id: string) {
  return prisma.card.update({ where: { id, userId }, data: { archived: true } });
}

export async function deleteCard(userId: string, id: string) {
  return prisma.card.delete({ where: { id, userId } });
}

export async function findCardById(userId: string, id: string) {
  const card = await prisma.card.findUnique({ where: { id, userId } });
  if (!card) return null;
  return { ...card, limit: Number(card.limit) };
}

/**
 * Calcula o período da fatura atual (aberta) de um cartão a partir do dia de
 * fechamento, reaproveitando a mesma regra usada no card do dashboard.
 */
function getCurrentInvoicePeriod(closingDay: number, reference = new Date()) {
  const closingThisMonth = new Date(reference.getFullYear(), reference.getMonth(), closingDay);
  const periodEnd =
    reference > closingThisMonth
      ? new Date(reference.getFullYear(), reference.getMonth() + 1, closingDay)
      : closingThisMonth;
  const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth() - 1, closingDay);
  return { periodStart, periodEnd };
}

/** Visão completa de um cartão: fatura aberta, parcelas futuras e histórico de faturas fechadas. */
export async function getCardDetail(userId: string, cardId: string, reference = new Date()) {
  const card = await findCardById(userId, cardId);
  if (!card) return null;

  const { periodStart, periodEnd } = getCurrentInvoicePeriod(card.closingDay, reference);

  const [openInvoiceTransactions, installments, closedInvoicesRaw] = await Promise.all([
    prisma.transaction.findMany({
      where: { cardId, date: { gt: periodStart, lte: periodEnd } },
      orderBy: { date: "desc" },
      include: { category: { select: { name: true, color: true } } },
    }),
    prisma.installment.findMany({
      where: { cardId },
      orderBy: { firstDueDate: "desc" },
    }),
    // Transações anteriores ao período aberto, usadas para montar o histórico de faturas fechadas
    prisma.transaction.findMany({
      where: { cardId, date: { lte: periodStart } },
      orderBy: { date: "desc" },
      select: { amount: true, date: true },
      take: 500,
    }),
  ]);

  const openInvoiceTotal = openInvoiceTransactions.reduce((sum, t) => sum + toNumber(t.amount), 0);

  const historyByMonth = new Map<string, number>();
  for (const t of closedInvoicesRaw) {
    const key = format(t.date, "yyyy-MM");
    historyByMonth.set(key, (historyByMonth.get(key) ?? 0) + toNumber(t.amount));
  }
  const closedInvoiceHistory = Array.from(historyByMonth.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .map(([month, total]) => ({ month, total }));

  return {
    card,
    availableLimit: card.limit - openInvoiceTotal,
    openInvoice: {
      total: openInvoiceTotal,
      periodStart,
      periodEnd,
      transactions: openInvoiceTransactions.map((t) => ({
        id: t.id,
        title: t.title,
        amount: toNumber(t.amount),
        date: t.date,
        category: t.category,
      })),
    },
    installments: installments.map((i) => ({
      id: i.id,
      title: i.title,
      totalAmount: toNumber(i.totalAmount),
      installmentAmount: toNumber(i.installmentAmount),
      totalCount: i.totalCount,
      paidCount: i.paidCount,
      remaining: i.totalCount - i.paidCount,
    })),
    closedInvoiceHistory,
  };
}
