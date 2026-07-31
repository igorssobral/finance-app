"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import type { ReportData } from "@/services/report-service";

function buildRows(report: ReportData) {
  return report.transactions.map((t) => ({
    Data: format(new Date(t.date), "dd/MM/yyyy"),
    Título: t.title,
    Tipo: t.type === "INCOME" ? "Receita" : "Despesa",
    Categoria: t.category ?? "—",
    Conta: t.account ?? "—",
    Cartão: t.card ?? "—",
    Valor: t.amount,
  }));
}

function fileBaseName(report: ReportData) {
  const start = format(new Date(report.range.start), "yyyy-MM-dd");
  const end = format(new Date(report.range.end), "yyyy-MM-dd");
  return `relatorio_${start}_a_${end}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportToCsv(report: ReportData) {
  const csv = Papa.unparse(buildRows(report));
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${fileBaseName(report)}.csv`);
}

export function exportReportToExcel(report: ReportData) {
  const worksheet = XLSX.utils.json_to_sheet(buildRows(report));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

  const summarySheet = XLSX.utils.json_to_sheet([
    { Métrica: "Receitas", Valor: report.totals.income },
    { Métrica: "Despesas", Valor: report.totals.expense },
    { Métrica: "Saldo", Valor: report.totals.balance },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

  XLSX.writeFile(workbook, `${fileBaseName(report)}.xlsx`);
}

export function exportReportToPdf(report: ReportData) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório Financeiro", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const periodText = `${report.range.label}: ${format(new Date(report.range.start), "dd/MM/yyyy")} a ${format(
    new Date(report.range.end),
    "dd/MM/yyyy",
  )}`;
  doc.text(periodText, 14, 25);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Receitas: ${formatCurrency(report.totals.income)}`, 14, 35);
  doc.text(`Despesas: ${formatCurrency(report.totals.expense)}`, 14, 41);
  doc.text(`Saldo: ${formatCurrency(report.totals.balance)}`, 14, 47);

  autoTable(doc, {
    startY: 55,
    head: [["Data", "Título", "Tipo", "Categoria", "Valor"]],
    body: report.transactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }),
      t.title,
      t.type === "INCOME" ? "Receita" : "Despesa",
      t.category ?? "—",
      formatCurrency(t.amount),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
  });

  doc.save(`${fileBaseName(report)}.pdf`);
}
