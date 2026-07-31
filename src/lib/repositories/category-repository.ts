import { prisma } from "@/lib/prisma";
import type { CategoryInput } from "@/lib/validations/category";

export async function findCategories(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  });

  return categories.map((c) => ({
    ...c,
    monthlyBudget: c.monthlyBudget ? Number(c.monthlyBudget) : null,
    transactionCount: c._count.transactions,
  }));
}

export async function createCategory(userId: string, data: CategoryInput) {
  return prisma.category.create({
    data: {
      userId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      monthlyBudget: data.monthlyBudget ?? null,
    },
  });
}

export async function updateCategory(userId: string, id: string, data: CategoryInput) {
  return prisma.category.update({
    where: { id, userId },
    data: {
      name: data.name,
      color: data.color,
      icon: data.icon,
      monthlyBudget: data.monthlyBudget ?? null,
    },
  });
}

export async function deleteCategory(userId: string, id: string) {
  return prisma.category.delete({ where: { id, userId } });
}

export async function findCategoryById(userId: string, id: string) {
  const category = await prisma.category.findUnique({ where: { id, userId } });
  if (!category) return null;
  return { ...category, monthlyBudget: category.monthlyBudget ? Number(category.monthlyBudget) : null };
}
