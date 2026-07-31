"use server";

import { auth } from "@/lib/auth";
import { suggestCategory, type CategorySuggestion } from "@/services/ai-categorization-service";
import { extractReceiptData, type ReceiptExtraction } from "@/services/ocr-service";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function suggestCategoryAction(
  title: string,
  description: string,
): Promise<ActionResult<CategorySuggestion>> {
  const userId = await requireUserId();

  try {
    const data = await suggestCategory(userId, { title, description });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao sugerir categoria" };
  }
}

export async function extractReceiptDataAction(
  base64Image: string,
  mimeType: string,
): Promise<ActionResult<ReceiptExtraction>> {
  await requireUserId();

  try {
    const data = await extractReceiptData(base64Image, mimeType);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao ler o comprovante" };
  }
}
