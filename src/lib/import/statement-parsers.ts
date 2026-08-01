"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedStatementRow {
  date: string; // yyyy-MM-dd
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
}

/** Tenta normalizar uma data em vários formatos comuns de extrato para yyyy-MM-dd. */
function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();

  // yyyy-MM-dd (já normalizado) ou yyyyMMdd (OFX)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }
  // dd/MM/yyyy
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;

  return null;
}

function normalizeRow(dateRaw: string, description: string, amountRaw: number | string): ParsedStatementRow | null {
  const date = normalizeDate(String(dateRaw));
  const amount = typeof amountRaw === "number" ? amountRaw : Number(String(amountRaw).replace(",", "."));
  if (!date || Number.isNaN(amount) || amount === 0) return null;

  return {
    date,
    description: description?.trim() || "Transação importada",
    amount: Math.abs(amount),
    type: amount >= 0 ? "INCOME" : "EXPENSE",
  };
}

/** Espera colunas nomeadas como Data/Date, Descrição/Description, Valor/Amount (case-insensitive). */
export function parseCsvFile(file: File): Promise<ParsedStatementRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: ParsedStatementRow[] = [];
        for (const row of results.data) {
          const keys = Object.keys(row).reduce<Record<string, string>>((acc, k) => {
            const value = row[k];
            acc[k.toLowerCase().trim()] = value ?? "";
            return acc;
          }, {});
          const date = keys["data"] ?? keys["date"];
          const description = keys["descrição"] ?? keys["descricao"] ?? keys["description"] ?? "";
          const amount = keys["valor"] ?? keys["amount"];
          if (!date || amount === undefined || amount === "") continue;

          const normalized = normalizeRow(date, description, amount);
          if (normalized) rows.push(normalized);
        }
        resolve(rows);
      },
      error: reject,
    });
  });
}

export async function parseXlsxFile(file: File): Promise<ParsedStatementRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    return [];
  }

  const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

  const rows: ParsedStatementRow[] = [];
  for (const row of data) {
    const keys = Object.keys(row).reduce<Record<string, string | number>>((acc, k) => {
      const value = row[k];
      if (value !== undefined) {
        acc[k.toLowerCase().trim()] = value;
      }
      return acc;
    }, {});
    const date = keys["data"] ?? keys["date"];
    const description = String(keys["descrição"] ?? keys["descricao"] ?? keys["description"] ?? "");
    const amount = keys["valor"] ?? keys["amount"];
    if (date === undefined || amount === undefined) continue;

    const normalized = normalizeRow(String(date), description, amount);
    if (normalized) rows.push(normalized);
  }
  return rows;
}

/**
 * Parser simplificado de OFX: extrai os blocos <STMTTRN>...</STMTTRN> via regex.
 * Cobre o formato SGML (OFX 1.x) mais comum entre bancos brasileiros.
 */
export async function parseOfxFile(file: File): Promise<ParsedStatementRow[]> {
  const text = await file.text();
  const rows: ParsedStatementRow[] = [];

  const transactionBlocks = text.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) ?? [];

  for (const block of transactionBlocks) {
    const amountMatch = block.match(/<TRNAMT>([-\d.,]+)/i);
    const dateMatch = block.match(/<DTPOSTED>(\d{8})/i);
    const memoMatch = block.match(/<MEMO>([^\n<]+)/i) ?? block.match(/<NAME>([^\n<]+)/i);

    if (!amountMatch || !dateMatch) continue;

    const dateValue = dateMatch[1] ?? "";
    const amountValue = amountMatch[1] ?? "";
    const memoValue = memoMatch?.[1] ?? "Transação importada";

    const normalized = normalizeRow(dateValue, memoValue, amountValue);
    if (normalized) rows.push(normalized);
  }

  return rows;
}

export async function parseStatementFile(file: File): Promise<ParsedStatementRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") return parseCsvFile(file);
  if (extension === "xlsx" || extension === "xls") return parseXlsxFile(file);
  if (extension === "ofx") return parseOfxFile(file);
  throw new Error("Formato não suportado. Use .csv, .xlsx ou .ofx");
}
