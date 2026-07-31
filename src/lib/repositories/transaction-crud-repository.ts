import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TransactionFilters, TransactionInput } from "@/lib/validations/transaction";

export interface TransactionListItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  isRecurring: boolean;
  isInstallment: boolean;
  category: { id: string; name: string; color: string; icon: string } | null;
  account: { id: string; name: string; color: string } | null;
  card: { id: string; name: string; color: string } | null;
}

export function buildWhere(userId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.accountId) where.accountId = filters.accountId;
  if (filters.cardId) where.cardId = filters.cardId;
  if (filters.onlyRecurring) where.isRecurring = true;
  if (filters.onlyInstallment) where.isInstallment = true;

  if (filters.dateFrom || filters.dateTo) {
    where.date = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {
      ...(filters.minAmount !== undefined ? { gte: filters.minAmount } : {}),
      ...(filters.maxAmount !== undefined ? { lte: filters.maxAmount } : {}),
    };
  }

  return where;
}

/** Lista paginada de transações com todos os filtros do módulo de transações. */
export async function findTransactions(userId: string, filters: TransactionFilters) {
  const where = buildWhere(userId, filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: filters.pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        type: true,
        date: true,
        isRecurring: true,
        isInstallment: true,
        category: { select: { id: true, name: true, color: true, icon: true } },
        account: { select: { id: true, name: true, color: true } },
        card: { select: { id: true, name: true, color: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const mapped: TransactionListItem[] = items.map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  return { items: mapped, total, page: filters.page, pageSize: filters.pageSize };
}

export async function createTransaction(userId: string, data: TransactionInput) {
  return prisma.transaction.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      type: data.type,
      date: data.date,
      categoryId: data.categoryId || null,
      accountId: data.accountId || null,
      cardId: data.cardId || null,
      isRecurring: data.isRecurring,
      isInstallment: data.isInstallment,
      notes: data.notes || null,
    },
  });
}

export async function updateTransaction(userId: string, id: string, data: TransactionInput) {
  // where com userId garante que um usuário não edite transação de outro
  return prisma.transaction.update({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description || null,
      amount: data.amount,
      type: data.type,
      date: data.date,
      categoryId: data.categoryId || null,
      accountId: data.accountId || null,
      cardId: data.cardId || null,
      isRecurring: data.isRecurring,
      isInstallment: data.isInstallment,
      notes: data.notes || null,
    },
  });
}

export async function deleteTransaction(userId: string, id: string) {
  return prisma.transaction.delete({ where: { id, userId } });
}

export async function findTransactionById(userId: string, id: string) {
  const transaction = await prisma.transaction.findUnique({ where: { id, userId } });
  if (!transaction) return null;
  return { ...transaction, amount: Number(transaction.amount) };
}

/** Opções para os selects do formulário (categorias, contas, cartões ativos do usuário). */
export async function getTransactionFormOptions(userId: string) {
  const [categories, accounts, cards] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true, icon: true },
    }),
    prisma.account.findMany({
      where: { userId, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
    prisma.card.findMany({
      where: { userId, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return { categories, accounts, cards };
}
