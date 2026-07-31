"use server";

import { auth } from "@/lib/auth";
import { answerFinancialQuestion } from "@/services/assistant-service";

type ActionResult = { success: true; answer: string } | { success: false; error: string };

export async function askAssistantAction(question: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };

  if (!question || question.trim().length < 3) {
    return { success: false, error: "Digite uma pergunta" };
  }

  try {
    const answer = await answerFinancialQuestion(session.user.id, question.trim());
    return { success: true, answer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao processar a pergunta",
    };
  }
}
