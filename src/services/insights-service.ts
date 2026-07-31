import { getCategoryBreakdown } from "@/lib/repositories/transaction-repository";
import { subMonths } from "date-fns";

export interface Insight {
  id: string;
  message: string;
  tone: "warning" | "positive" | "neutral";
}

/**
 * Gera insights simples baseados em regras (variação de categoria mês a mês,
 * maior gasto, etc). Não usa IA generativa — isso fica reservado para a Etapa 9
 * (assistente em linguagem natural via Anthropic API).
 */
export async function generateDashboardInsights(
  userId: string,
  cards: {
    savings: { value: number; changePercent: number };
  },
): Promise<Insight[]> {
  const reference = new Date();
  const [currentCategories, previousCategories] = await Promise.all([
    getCategoryBreakdown(userId, reference).catch(() => []),
    getCategoryBreakdown(userId, subMonths(reference, 1)).catch(() => []),
  ]);

  const insights: Insight[] = [];

  // Maior gasto do mês
  if (currentCategories[0]) {
    insights.push({
      id: "maior-gasto",
      message: `Seu maior gasto este mês foi com ${currentCategories[0].name}.`,
      tone: "neutral",
    });
  }

  // Variação por categoria vs. mês anterior (destaca a maior alta percentual)
  let biggestIncrease: { name: string; percent: number } | null = null;
  for (const current of currentCategories) {
    const previous = previousCategories.find((p) => p.categoryId === current.categoryId);
    if (!previous || previous.value === 0) continue;
    const percent = ((current.value - previous.value) / previous.value) * 100;
    if (percent > 15 && (!biggestIncrease || percent > biggestIncrease.percent)) {
      biggestIncrease = { name: current.name, percent: Math.round(percent) };
    }
  }
  if (biggestIncrease) {
    insights.push({
      id: "alta-categoria",
      message: `Você gastou ${biggestIncrease.percent}% mais com ${biggestIncrease.name} este mês.`,
      tone: "warning",
    });
  }

  // Economia caiu vs. mês anterior
  if (cards.savings.changePercent < -10) {
    insights.push({
      id: "economia-caiu",
      message: `Sua economia caiu ${Math.abs(cards.savings.changePercent).toFixed(0)}% em relação ao mês passado.`,
      tone: "warning",
    });
  } else if (cards.savings.changePercent > 10) {
    insights.push({
      id: "economia-subiu",
      message: `Sua economia cresceu ${cards.savings.changePercent.toFixed(0)}% em relação ao mês passado.`,
      tone: "positive",
    });
  }

  return insights;
}
