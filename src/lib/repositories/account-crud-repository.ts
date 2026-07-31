import { prisma } from "@/lib/prisma";
import type { AccountInput } from "@/lib/validations/account";

export async function findAccounts(userId: string, includeArchived = false) {
  const accounts = await prisma.account.findMany({
    where: { userId, ...(includeArchived ? {} : { archived: false }) },
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  });

  return accounts.map((a) => ({
    ...a,
    initialBalance: Number(a.initialBalance),
    transactionCount: a._count.transactions,
  }));
}

export async function createAccount(userId: string, data: AccountInput) {
  return prisma.account.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      bank: data.bank || null,
      color: data.color,
      icon: data.icon,
      initialBalance: data.initialBalance,
    },
  });
}

export async function updateAccount(userId: string, id: string, data: AccountInput) {
  return prisma.account.update({
    where: { id, userId },
    data: {
      name: data.name,
      type: data.type,
      bank: data.bank || null,
      color: data.color,
      icon: data.icon,
      initialBalance: data.initialBalance,
    },
  });
}

/** Arquiva em vez de excluir quando há transações vinculadas (preserva o histórico). */
export async function archiveAccount(userId: string, id: string) {
  return prisma.account.update({ where: { id, userId }, data: { archived: true } });
}

export async function deleteAccount(userId: string, id: string) {
  return prisma.account.delete({ where: { id, userId } });
}

export async function findAccountById(userId: string, id: string) {
  const account = await prisma.account.findUnique({ where: { id, userId } });
  if (!account) return null;
  return { ...account, initialBalance: Number(account.initialBalance) };
}

/** Saldo atual de uma conta específica: saldo inicial + receitas - despesas dela. */
export async function getAccountBalance(userId: string, accountId: string) {
  const [account, totals] = await Promise.all([
    prisma.account.findUnique({ where: { id: accountId, userId }, select: { initialBalance: true } }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, accountId },
      _sum: { amount: true },
    }),
  ]);

  const income = Number(totals.find((t) => t.type === "INCOME")?._sum.amount ?? 0);
  const expense = Number(totals.find((t) => t.type === "EXPENSE")?._sum.amount ?? 0);

  return Number(account?.initialBalance ?? 0) + income - expense;
}
