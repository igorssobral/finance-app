import { getAnthropicClient, AI_MODEL } from "@/lib/ai/anthropic-client";
import { prisma } from "@/lib/prisma";

export interface CategorySuggestion {
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
}

/**
 * Sugere a categoria mais provável para uma transação com base no título e
 * descrição, usando apenas as categorias que o próprio usuário já cadastrou
 * (nunca inventa uma categoria nova). Confidence 0 significa "sem sugestão boa".
 */
export async function suggestCategory(
  userId: string,
  input: { title: string; description?: string },
): Promise<CategorySuggestion> {
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    return { categoryId: null, categoryName: null, confidence: 0 };
  }

  const anthropic = getAnthropicClient();
  const categoryList = categories.map((c) => c.name).join(", ");

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 200,
    system:
      "Você categoriza transações financeiras. Responda APENAS com um JSON válido, sem markdown e sem texto extra.",
    messages: [
      {
        role: "user",
        content: `Categorias disponíveis: ${categoryList}

Transação:
Título: ${input.title}
Descrição: ${input.description ?? "(nenhuma)"}

Responda no formato exato: {"category": "<nome exato de uma das categorias disponíveis, ou null se nenhuma fizer sentido>", "confidence": <número de 0 a 1>}`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return { categoryId: null, categoryName: null, confidence: 0 };
  }

  try {
    const parsed = JSON.parse(textBlock.text.trim());
    const match = categories.find((c) => c.name === parsed.category);
    if (!match) return { categoryId: null, categoryName: null, confidence: 0 };

    return {
      categoryId: match.id,
      categoryName: match.name,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    };
  } catch {
    // Resposta do modelo não veio em JSON válido — falha de forma segura, sem quebrar o form
    return { categoryId: null, categoryName: null, confidence: 0 };
  }
}
