"use client";

import * as React from "react";
import { Plus, TrendingUp, Wallet, PiggyBank, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { InvestmentFormDialog } from "@/components/investments/investment-form-dialog";
import { InvestmentDistributionChart } from "@/components/investments/investment-distribution-chart";
import { InvestmentSimulator } from "@/components/investments/investment-simulator";
import { useInvestmentDashboardQuery, useDeleteInvestment } from "@/hooks/use-investments";
import { INVESTMENT_TYPES } from "@/lib/validations/investment";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

type InvestmentItem = NonNullable<
  ReturnType<typeof useInvestmentDashboardQuery>["data"]
>["investments"][number];

export default function InvestimentosPage() {
  const { data, isLoading } = useInvestmentDashboardQuery();
  const deleteMutation = useDeleteInvestment();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InvestmentItem | null>(null);
  const [deleting, setDeleting] = React.useState<InvestmentItem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        description="Acompanhe seu patrimônio, rendimento e distribuição"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo investimento
          </Button>
        }
      />

      <InvestmentSimulator />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !data || data.investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum investimento cadastrado"
          description="Cadastre seus investimentos para acompanhar patrimônio e rendimento."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Patrimônio investido</CardTitle>
                <Wallet className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency(data.current)}</p>
                <p className="text-xs text-muted-foreground">Total aportado: {formatCurrency(data.invested)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Rendimento</CardTitle>
                <TrendingUp className="size-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-semibold tracking-tight", data.profit < 0 && "text-destructive")}>
                  {formatCurrency(data.profit)}
                </p>
                <p className="text-xs text-muted-foreground">{formatPercent(data.profitPercent)} sobre o investido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Ativos cadastrados</CardTitle>
                <PiggyBank className="size-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{data.investments.length}</p>
                <p className="text-xs text-muted-foreground">{data.distribution.length} categoria(s) diferentes</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Distribuição por tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <InvestmentDistributionChart data={data.distribution} />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {data.investments.map((investment) => {
              const typeLabel = INVESTMENT_TYPES.find((t) => t.value === investment.type)?.label;
              return (
                <Card key={investment.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{investment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabel}
                        {investment.broker ? ` · ${investment.broker}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(investment.currentAmount)}</p>
                        <p className={cn("text-xs", investment.profit >= 0 ? "text-success" : "text-destructive")}>
                          {investment.profit >= 0 ? "+" : ""}
                          {formatCurrency(investment.profit)}
                        </p>
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
                              setEditing(investment);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setDeleting(investment)}
                          >
                            <Trash2 className="size-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <InvestmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  name: editing.name,
                  type: editing.type,
                  investedAmount: editing.investedAmount,
                  currentAmount: editing.currentAmount,
                  quantity: editing.quantity ?? undefined,
                  broker: editing.broker ?? "",
                  purchaseDate: editing.purchaseDate,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir investimento?"
        description={`Tem certeza que deseja excluir "${deleting?.name}"?`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
