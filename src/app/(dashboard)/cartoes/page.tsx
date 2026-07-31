"use client";

import * as React from "react";
import { Plus, CreditCard as CreditCardIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { CreditCardVisual } from "@/components/cards/credit-card-visual";
import { CardFormDialog } from "@/components/cards/card-form-dialog";
import { CardDetailDialog } from "@/components/cards/card-detail-dialog";
import { useCardsQuery, useDeleteCard } from "@/hooks/use-cards";

type CardItem = Awaited<ReturnType<typeof useCardsQuery>>["data"] extends (infer T)[] | undefined
  ? T
  : never;

export default function CartoesPage() {
  const { data: cards, isLoading } = useCardsQuery();
  const deleteMutation = useDeleteCard();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CardItem | null>(null);
  const [deleting, setDeleting] = React.useState<CardItem | null>(null);
  const [detailCardId, setDetailCardId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões"
        description="Cartões de crédito, faturas e parcelamentos"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Novo cartão
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[1.6/1] w-full rounded-2xl" />
          ))}
        </div>
      ) : !cards || cards.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="Nenhum cartão cadastrado"
          description="Cadastre seus cartões para acompanhar faturas e parcelamentos."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="group relative">
              <CreditCardVisual
                name={card.name}
                brand={card.brand}
                color={card.color}
                limit={card.limit}
                availableLimit={card.availableLimit}
                onClick={() => setDetailCardId(card.id)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 size-8 text-white hover:bg-white/20 hover:text-white"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      setEditing(card);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="size-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setDeleting(card)}
                  >
                    <Trash2 className="size-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <CardFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  name: editing.name,
                  brand: editing.brand,
                  limit: editing.limit,
                  closingDay: editing.closingDay,
                  dueDay: editing.dueDay,
                  color: editing.color,
                },
              }
            : null
        }
      />

      <CardDetailDialog cardId={detailCardId} onOpenChange={(open) => !open && setDetailCardId(null)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir cartão?"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Se houver transações ou parcelamentos vinculados, o cartão será arquivado em vez de excluído.`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
