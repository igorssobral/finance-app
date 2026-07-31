"use client";

import { Download, FileText, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { exportReportToCsv, exportReportToExcel, exportReportToPdf } from "@/lib/export/report-export";
import type { ReportData } from "@/services/report-service";

export function ReportExportMenu({ report }: { report: ReportData }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => exportReportToPdf(report)}>
          <FileText className="size-4" /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportReportToExcel(report)}>
          <FileSpreadsheet className="size-4" /> Excel
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportReportToCsv(report)}>
          <FileType className="size-4" /> CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
