import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/**
 * Client singleton da Anthropic API. Lança um erro claro se a chave não estiver
 * configurada, em vez de falhar silenciosamente — os recursos de IA (categorização
 * automática e assistente em linguagem natural) dependem de `ANTHROPIC_API_KEY`.
 */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente para usar os recursos de IA.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** Configurável via env var pois nomes de modelo mudam com o tempo. */
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
