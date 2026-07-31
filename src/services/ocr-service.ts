import { getAnthropicClient, AI_MODEL } from "@/lib/ai/anthropic-client";

export interface ReceiptExtraction {
  title: string | null;
  amount: number | null;
  date: string | null; // ISO yyyy-MM-dd
}

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * Extrai título (nome do estabelecimento), valor total e data de um comprovante
 * ou nota fiscal fotografado, usando a visão do Claude. Não persiste a imagem —
 * isso fica a cargo do upload de anexos (Vercel Blob), fora do escopo desta função.
 */
export async function extractReceiptData(
  base64Image: string,
  mimeType: string,
): Promise<ReceiptExtraction> {
  if (!SUPPORTED_MIME_TYPES.includes(mimeType as (typeof SUPPORTED_MIME_TYPES)[number])) {
    throw new Error("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
  }

  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 300,
    system:
      "Você extrai dados de comprovantes e notas fiscais. Responda APENAS com um JSON válido, sem markdown e sem texto extra.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Extraia deste comprovante/nota fiscal:
- title: nome do estabelecimento
- amount: valor total pago (apenas número, sem símbolo de moeda)
- date: data da compra no formato YYYY-MM-DD

Responda no formato exato: {"title": "...", "amount": 00.00, "date": "YYYY-MM-DD"}
Se não conseguir identificar algum campo com confiança, use null nesse campo.`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return { title: null, amount: null, date: null };
  }

  try {
    const parsed = JSON.parse(textBlock.text.trim());
    return {
      title: typeof parsed.title === "string" ? parsed.title : null,
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      date: typeof parsed.date === "string" ? parsed.date : null,
    };
  } catch {
    return { title: null, amount: null, date: null };
  }
}
