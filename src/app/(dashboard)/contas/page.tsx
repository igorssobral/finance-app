"use client";

import * as React from "react";
import { Plus, Landmark, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { useAccountsQuery, useDeleteAccount } from "@/hooks/use-accounts";
import { ACCOUNT_TYPES } from "@/lib/validations/account";
import { getIcon } from "@/lib/icon-map";
import { cn, formatCurrency } from "@/lib/utils";

type AccountItem = Awaited<ReturnType<typeof useAccountsQuery>>["data"] extends (infer T)[] | undefined
  ? T
  : never;

export default function ContasPage() {
  const { data: accounts, isLoading } = useAccountsQuery();
  const deleteMutation = useDeleteAccount();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AccountItem | null>(null);
  const [deleting, setDeleting] = React.useState<AccountItem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas"
        description="Contas correntes, poupança, carteiras e contas digitais"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova conta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhuma conta cadastrada"
          description="Cadastre suas contas para acompanhar o saldo automaticamente."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = getIcon(account.icon);
            const typeLabel = ACCOUNT_TYPES.find((t) => t.value === account.type)?.label;
            return (
              <Card key={account.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-10 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: account.color }}
                      >
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabel} {account.bank ? `· ${account.bank}` : ""}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(account);
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="size-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setDeleting(account)}
                        >
                          <Trash2 className="size-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Saldo atual</p>
                    <p
                      className={cn(
                        "text-xl font-semibold tracking-tight",
                        account.currentBalance < 0 && "text-destructive",
                      )}
                    >
                      {formatCurrency(account.currentBalance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  name: editing.name,
                  type: editing.type,
                  bank: editing.bank ?? "",
                  color: editing.color,
                  icon: editing.icon,
                  initialBalance: editing.initialBalance,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir conta?"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Se houver transações vinculadas, a conta será arquivada em vez de excluída.`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
