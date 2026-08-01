import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/**
 * Client singleton do Google Gemini. Usa o tier gratuito da API (modelos
 * Flash) — gere uma chave grátis em https://aistudio.google.com/apikey.
 * Lança um erro claro se a chave não estiver configurada, em vez de falhar
 * silenciosamente.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Gere uma chave gratuita em https://aistudio.google.com/apikey e defina a variável de ambiente para usar os recursos de IA.",
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * Alias mantido pelo próprio Google, sempre apontando para o modelo Flash
 * estável mais recente — evita precisar atualizar o código a cada novo
 * lançamento de modelo. Configurável via env var para quem quiser fixar uma
 * versão específica.
 */
export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
