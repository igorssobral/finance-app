"use client";

import * as React from "react";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Repeat, Layers, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/lib/utils";
import type { TransactionListItem } from "@/lib/repositories/transaction-crud-repository";

interface TransactionsTableProps {
  data: TransactionListItem[];
  onEdit: (transaction: TransactionListItem) => void;
  onDelete: (transaction: TransactionListItem) => void;
}

const ROW_HEIGHT = 60;

export function TransactionsTable({ data, onEdit, onDelete }: TransactionsTableProps) {
  const columns = React.useMemo<ColumnDef<TransactionListItem>[]>(
    () => [
      {
        header: "Data",
        accessorKey: "date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.date), "dd MMM yyyy", { locale: ptBR })}
          </span>
        ),
        size: 120,
      },
      {
        header: "Descrição",
        accessorKey: "title",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{t.title}</span>
                {t.isRecurring && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Repeat className="size-3.5 shrink-0 text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent>Transação recorrente</TooltipContent>
                  </Tooltip>
                )}
                {t.isInstallment && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Layers className="size-3.5 shrink-0 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>Compra parcelada</TooltipContent>
                  </Tooltip>
                )}
              </div>
              {t.description && (
                <span className="truncate text-xs text-muted-foreground">{t.description}</span>
              )}
            </div>
          );
        },
      },
      {
        header: "Categoria",
        accessorKey: "category",
        cell: ({ row }) => {
          const category = row.original.category;
          if (!category) return <span className="text-xs text-muted-foreground">—</span>;
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: category.color }} />
              {category.name}
            </span>
          );
        },
        size: 140,
      },
      {
        header: "Conta / Cartão",
        accessorKey: "account",
        cell: ({ row }) => {
          const { account, card } = row.original;
          const label = card?.name ?? account?.name;
          if (!label) return <span className="text-xs text-muted-foreground">—</span>;
          return <span className="text-xs text-muted-foreground">{label}</span>;
        },
        size: 140,
      },
      {
        header: "Valor",
        accessorKey: "amount",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <span
              className={cn(
                "font-medium tabular-nums",
                t.type === "INCOME" ? "text-success" : "text-destructive",
              )}
            >
              {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
            </span>
          );
        },
        size: 130,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                <Pencil className="size-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDelete(row.original)}
              >
                <Trash2 className="size-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[120px_1fr_140px_140px_130px_50px] gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
        {table.getFlatHeaders().map((header) => (
          <div key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</div>
        ))}
      </div>

      <div ref={parentRef} className="max-h-[560px] overflow-y-auto">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];

            if (!row) {
              return null;
            }

            return (
              <div
                key={row.id}
                className="absolute left-0 top-0 grid w-full grid-cols-[120px_1fr_140px_140px_130px_50px] items-center gap-3 border-b border-border px-4 transition-colors hover:bg-muted/30"
                style={{ height: ROW_HEIGHT, transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
