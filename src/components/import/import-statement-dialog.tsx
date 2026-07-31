"use client";

import * as React from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { parseStatementFile, type ParsedStatementRow } from "@/lib/import/statement-parsers";
import { importStatementAction } from "@/app/(dashboard)/transacoes/import-actions";
import { useTransactionFormOptions } from "@/hooks/use-transactions";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

interface ImportStatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStatementDialog({ open, onOpenChange }: ImportStatementDialogProps) {
  const { data: options } = useTransactionFormOptions();
  const queryClient = useQueryClient();

  const [file, setFile] = React.useState<File | null>(null);
  const [rows, setRows] = React.useState<ParsedStatementRow[]>([]);
  const [accountId, setAccountId] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsParsing(true);
    try {
      const parsed = await parseStatementFile(selected);
      setRows(parsed);
      if (parsed.length === 0) {
        toast.warning("Nenhuma transação reconhecida neste arquivo");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao ler o arquivo");
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  }

  function reset() {
    setFile(null);
    setRows([]);
    setAccountId("");
  }

  async function handleImport() {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toUpperCase();
    const source = extension === "OFX" ? "OFX" : extension === "XLSX" || extension === "XLS" ? "XLSX" : "CSV";

    setIsImporting(true);
    try {
      const result = await importStatementAction(accountId, source, file.name, rows);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.imported} transação(ões) importada(s), ${result.skipped} duplicada(s) ignorada(s)`);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      reset();
      onOpenChange(false);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar extrato</DialogTitle>
          <DialogDescription>Formatos suportados: OFX, CSV e XLSX.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center hover:bg-accent/30">
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clique para selecionar um arquivo</span>
              <input type="file" accept=".csv,.xlsx,.xls,.ofx" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Importar para a conta</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta de destino" /></SelectTrigger>
                  <SelectContent>
                    {options?.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isParsing ? (
                <p className="text-sm text-muted-foreground">Lendo arquivo...</p>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  <p className="px-1 text-xs text-muted-foreground">
                    {rows.length} transação(ões) encontrada(s) — pré-visualização:
                  </p>
                  {rows.slice(0, 30).map((row, i) => (
                    <div key={i} className="flex items-center justify-between rounded px-2 py-1 text-sm">
                      <span className="truncate">{row.description}</span>
                      <span className={row.type === "INCOME" ? "text-success" : "text-destructive"}>
                        {row.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(row.amount)}
                      </span>
                    </div>
                  ))}
                  {rows.length > 30 && (
                    <p className="px-2 py-1 text-xs text-muted-foreground">
                      + {rows.length - 30} outra(s)...
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!file || rows.length === 0 || !accountId || isImporting || isParsing}
          >
            {isImporting && <Loader2 className="animate-spin" />}
            Importar {rows.length > 0 && `(${rows.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
