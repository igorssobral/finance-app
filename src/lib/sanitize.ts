import DOMPurify from "isomorphic-dompurify";

/**
 * Remove qualquer HTML/JS de campos de texto livre antes de persistir.
 * Usado em título, descrição e observações de transações, nomes de categoria,
 * metas, etc. — qualquer campo digitado pelo usuário e depois renderizado.
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
