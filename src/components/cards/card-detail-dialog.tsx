"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Progress } from "@/components/ui/progress";
import { Receipt, Layers, History } from "lucide-react";
import { useCardDetailQuery } from "@/hooks/use-cards";
import { formatCurrency } from "@/lib/utils";

interface CardDetailDialogProps {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailDialog({ cardId, onOpenChange }: CardDetailDialogProps) {
  const { data: detail, isLoading } = useCardDetailQuery(cardId);

  return (
    <Dialog open={!!cardId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{detail?.card.name ?? "Detalhes do cartão"}</DialogTitle>
          <DialogDescription>Fatura aberta, parcelas futuras e histórico</DialogDescription>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Limite disponível</span>
                <span className="font-medium">{formatCurrency(detail.availableLimit)}</span>
              </div>
              <Progress
                value={Math.round(((detail.card.limit - detail.availableLimit) / detail.card.limit) * 100)}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Limite total {formatCurrency(detail.card.limit)}
              </p>
            </div>

            <Tabs defaultValue="invoice">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="invoice" className="gap-1.5">
                  <Receipt className="size-3.5" /> Fatura
                </TabsTrigger>
                <TabsTrigger value="installments" className="gap-1.5">
                  <Layers className="size-3.5" /> Parcelas
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5">
                  <History className="size-3.5" /> Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invoice" className="max-h-72 space-y-2 overflow-y-auto">
                <p className="text-sm font-medium">
                  Fatura aberta: {formatCurrency(detail.openInvoice.total)}
                </p>
                {detail.openInvoice.transactions.length === 0 ? (
                  <EmptyState icon={Receipt} title="Nenhum gasto nesta fatura" className="py-8" />
                ) : (
                  detail.openInvoice.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      <div>
                        <p>{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(t.date), "dd MMM", { locale: ptBR })}
                          {t.category ? ` · ${t.category.name}` : ""}
                        </p>
                      </div>
                      <span className="font-medium">{formatCurrency(t.amount)}</span>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="installments" className="max-h-72 space-y-2 overflow-y-auto">
                {detail.installments.length === 0 ? (
                  <EmptyState icon={Layers} title="Nenhuma compra parcelada" className="py-8" />
                ) : (
                  detail.installments.map((i) => (
                    <div key={i.id} className="space-y-1 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <p>{i.title}</p>
                        <span className="font-medium">{formatCurrency(i.installmentAmount)}/mês</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {i.paidCount}/{i.totalCount} parcelas pagas · restam {i.remaining} · total{" "}
                        {formatCurrency(i.totalAmount)}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="max-h-72 space-y-2 overflow-y-auto">
                {detail.closedInvoiceHistory.length === 0 ? (
                  <EmptyState icon={History} title="Sem faturas fechadas ainda" className="py-8" />
                ) : (
                  detail.closedInvoiceHistory.map((h) => (
                    <div key={h.month} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      <span>{format(new Date(`${h.month}-01`), "MMMM 'de' yyyy", { locale: ptBR })}</span>
                      <span className="font-medium">{formatCurrency(h.total)}</span>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
