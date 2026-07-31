import { prisma } from "@/lib/prisma";
import type { ParsedStatementRow } from "@/lib/import/statement-parsers";

/**
 * Considera duplicata uma transação já existente na mesma conta, mesma data e
 * mesmo valor (independente do título) — critério simples mas eficaz para
 * evitar reimportar o mesmo extrato duas vezes.
 */
async function isDuplicate(userId: string, accountId: string, row: ParsedStatementRow) {
  const existing = await prisma.transaction.findFirst({
    where: {
      userId,
      accountId,
      date: new Date(row.date),
      amount: row.amount,
      type: row.type,
    },
    select: { id: true },
  });
  return !!existing;
}

export async function importStatementRows(
  userId: string,
  accountId: string,
  source: "OFX" | "CSV" | "XLSX",
  fileName: string,
  rows: ParsedStatementRow[],
) {
  const batch = await prisma.importBatch.create({
    data: { userId, source, fileName, status: "PENDING", rowCount: rows.length },
  });

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (await isDuplicate(userId, accountId, row)) {
      skipped += 1;
      continue;
    }

    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        title: row.description,
        amount: row.amount,
        type: row.type,
        date: new Date(row.date),
      },
    });
    imported += 1;
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: { status: "PROCESSED" },
  });

  return { batchId: batch.id, imported, skipped, total: rows.length };
}
