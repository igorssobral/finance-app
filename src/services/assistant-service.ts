import { getGeminiClient, AI_MODEL } from "@/lib/ai/gemini-client";
import { getTotalsByPeriod, getCategoryBreakdown } from "@/lib/repositories/transaction-repository";
import { getCurrentBalance } from "@/lib/repositories/account-repository";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface ParsedIntent {
  type: "category_spending" | "total_income" | "total_expense" | "balance" | "unknown";
  category?: string;
  months: number;
}

/**
 * PASSO 1: pede ao Gemini para extrair a intenção da pergunta em JSON estrito —
 * nunca deixamos o modelo responder com números direto, para não arriscar
 * alucinação de valores financeiros.
 */
async function parseIntent(question: string): Promise<ParsedIntent> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: `Pergunta: "${question}"

Classifique em um dos tipos: "category_spending" (gasto em uma categoria específica), "total_income" (total de receitas), "total_expense" (total de despesas), "balance" (saldo atual), "unknown" (não é sobre finanças pessoais).

Se mencionar um período em meses, extraia o número (padrão: 1 se não mencionado).
Se for "category_spending", extraia o nome da categoria mencionada.

Responda no formato exato: {"type": "...", "category": "..." ou null, "months": <número>}`,
    config: {
      systemInstruction:
        "Você extrai a intenção de perguntas financeiras. Responda APENAS com um JSON válido, sem markdown e sem texto extra.",
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) return { type: "unknown", months: 1 };

  try {
    const parsed = JSON.parse(text.trim());
    return {
      type: ["category_spending", "total_income", "total_expense", "balance"].includes(parsed.type)
        ? parsed.type
        : "unknown",
      category: parsed.category ?? undefined,
      months: typeof parsed.months === "number" && parsed.months > 0 ? Math.min(parsed.months, 24) : 1,
    };
  } catch {
    return { type: "unknown", months: 1 };
  }
}

/** PASSO 2: roda a consulta real no banco — os números da resposta vêm sempre daqui, nunca do modelo. */
async function resolveIntentData(userId: string, intent: ParsedIntent) {
  const now = new Date();

  if (intent.type === "balance") {
    const balance = await getCurrentBalance(userId);
    return { label: "saldo atual", value: balance };
  }

  const start = startOfMonth(subMonths(now, intent.months - 1));
  const end = endOfMonth(now);

  if (intent.type === "category_spending") {
    const breakdown = await getCategoryBreakdown(userId, now); // mês atual — aproximação simples
    const match = intent.category
      ? breakdown.find((c) => c.name.toLowerCase().includes(intent.category!.toLowerCase()))
      : undefined;
    return {
      label: intent.category ? `gasto com ${intent.category}` : "gasto na categoria",
      value: match?.value ?? 0,
      found: !!match,
    };
  }

  const totals = await getTotalsByPeriod(userId, start, end);
  if (intent.type === "total_income") return { label: "total de receitas", value: totals.income };
  return { label: "total de despesas", value: totals.expense };
}

/**
 * PASSO 3: pede ao Gemini para formular uma resposta natural em português,
 * mas fornecendo o número exato já calculado — instruído a nunca alterá-lo.
 */
async function phraseAnswer(question: string, label: string, value: number, months: number): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: `Pergunta original: "${question}"
Dado calculado: ${label} = ${formatCurrency(value)} (referente a ${months} ${months === 1 ? "mês" : "meses"})

Responda a pergunta usando esse valor exato.`,
    config: {
      systemInstruction:
        "Você é um assistente financeiro. Responda em português, em 1-2 frases curtas e diretas, usando EXATAMENTE o valor fornecido — nunca invente ou arredonde para outro número.",
    },
  });

  return response.text?.trim() || formatCurrency(value);
}

export async function answerFinancialQuestion(userId: string, question: string): Promise<string> {
  const intent = await parseIntent(question);

  if (intent.type === "unknown") {
    return "Não consegui entender isso como uma pergunta sobre suas finanças. Tente algo como \"quanto gastei com alimentação este mês?\" ou \"qual meu saldo atual?\".";
  }

  const data = await resolveIntentData(userId, intent);

  if (intent.type === "category_spending" && "found" in data && !data.found) {
    return `Não encontrei a categoria "${intent.category}" entre suas categorias cadastradas.`;
  }

  return phraseAnswer(question, data.label, data.value, intent.months);
}
