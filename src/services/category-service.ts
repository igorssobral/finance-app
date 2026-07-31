import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import {
  createCategory as createCategoryRepo,
  updateCategory as updateCategoryRepo,
  deleteCategory as deleteCategoryRepo,
  findCategoryById,
} from "@/lib/repositories/category-repository";
import type { CategoryInput } from "@/lib/validations/category";

function sanitizeInput(data: CategoryInput): CategoryInput {
  return { ...data, name: sanitizeText(data.name) };
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
      entity: "Category",
      entityId,
      action,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
    },
  });
}

export async function createCategoryWithAudit(userId: string, data: CategoryInput) {
  const category = await createCategoryRepo(userId, sanitizeInput(data));
  await logAudit(userId, category.id, "CREATE", undefined, category);
  return category;
}

export async function updateCategoryWithAudit(userId: string, id: string, data: CategoryInput) {
  const before = await findCategoryById(userId, id);
  if (!before) throw new Error("Categoria não encontrada");

  const category = await updateCategoryRepo(userId, id, sanitizeInput(data));
  await logAudit(userId, id, "UPDATE", before, category);
  return category;
}

export async function deleteCategoryWithAudit(userId: string, id: string) {
  const before = await findCategoryById(userId, id);
  if (!before) throw new Error("Categoria não encontrada");

  try {
    await deleteCategoryRepo(userId, id);
  } catch {
    throw new Error(
      "Não é possível excluir uma categoria com transações vinculadas. Edite as transações ou mantenha a categoria.",
    );
  }

  await logAudit(userId, id, "DELETE", before);
}
