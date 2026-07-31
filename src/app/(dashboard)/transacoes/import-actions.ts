"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { importStatementRows } from "@/lib/repositories/import-repository";
import type { ParsedStatementRow } from "@/lib/import/statement-parsers";

type ActionResult =
  | { success: true; imported: number; skipped: number; total: number }
  | { success: false; error: string };

export async function importStatementAction(
  accountId: string,
  source: "OFX" | "CSV" | "XLSX",
  fileName: string,
  rows: ParsedStatementRow[],
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autenticado" };
  if (session.user.role === "GUEST") {
    return { success: false, error: "Convidados têm acesso somente leitura" };
  }
  if (!accountId) return { success: false, error: "Selecione uma conta de destino" };
  if (rows.length === 0) return { success: false, error: "Nenhuma transação válida encontrada no arquivo" };

  const result = await importStatementRows(session.user.id, accountId, source, fileName, rows);

  revalidatePath("/transacoes");
  revalidatePath("/dashboard");
  return { success: true, ...result };
}
