"use client";

import * as React from "react";
import { Plus, ArrowLeftRight, ChevronLeft, ChevronRight, Layers, Repeat, ChevronDown, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TransactionFiltersBar } from "@/components/transactions/transaction-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { InstallmentPurchaseDialog } from "@/components/transactions/installment-purchase-dialog";
import { RecurringSubscriptionDialog } from "@/components/transactions/recurring-subscription-dialog";
import { ImportStatementDialog } from "@/components/import/import-statement-dialog";
import { useTransactionsQuery, useDeleteTransaction } from "@/hooks/use-transactions";
import type { TransactionFilters } from "@/lib/validations/transaction";
import type { TransactionListItem } from "@/lib/repositories/transaction-crud-repository";

const DEFAULT_FILTERS: Partial<TransactionFilters> = { page: 1, pageSize: 25 };

export default function TransacoesPage() {
  const [filters, setFilters] = React.useState<Partial<TransactionFilters>>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = React.useState(false);
  const [installmentOpen, setInstallmentOpen] = React.useState(false);
  const [recurringOpen, setRecurringOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TransactionListItem | null>(null);
  const [deleting, setDeleting] = React.useState<TransactionListItem | null>(null);

  const { data, isLoading, isFetching } = useTransactionsQuery(filters);
  const deleteMutation = useDeleteTransaction();

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction: TransactionListItem) {
    setEditing(transaction);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        description="Gerencie suas receitas e despesas"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="size-4" />
                Nova transação
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={openCreate}>
                <ArrowLeftRight className="size-4" /> Transação simples
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInstallmentOpen(true)}>
                <Layers className="size-4" /> Compra parcelada
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRecurringOpen(true)}>
                <Repeat className="size-4" /> Assinatura recorrente
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                <Upload className="size-4" /> Importar extrato
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <TransactionFiltersBar filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] w-full rounded-lg" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nenhuma transação encontrada"
          description="Ajuste os filtros ou registre sua primeira transação."
          action={
            <Button onClick={openCreate} variant="outline" className="gap-2">
              <Plus className="size-4" />
              Nova transação
            </Button>
          }
        />
      ) : (
        <>
          <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
            <TransactionsTable data={data.items} onEdit={openEdit} onDelete={setDeleting} />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.total} transação(ões) — página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: page - 1 }))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: page + 1 }))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <InstallmentPurchaseDialog open={installmentOpen} onOpenChange={setInstallmentOpen} />
      <RecurringSubscriptionDialog open={recurringOpen} onOpenChange={setRecurringOpen} />
      <ImportStatementDialog open={importOpen} onOpenChange={setImportOpen} />

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  title: editing.title,
                  description: editing.description ?? "",
                  amount: editing.amount,
                  type: editing.type,
                  date: editing.date,
                  categoryId: editing.category?.id ?? "",
                  accountId: editing.account?.id ?? "",
                  cardId: editing.card?.id ?? "",
                  isRecurring: editing.isRecurring,
                  isInstallment: editing.isInstallment,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir transação?"
        description={`Tem certeza que deseja excluir "${deleting?.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
