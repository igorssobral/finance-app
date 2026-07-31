"use client";

import * as React from "react";
import { Plus, Shapes, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCategoriesQuery, useDeleteCategory } from "@/hooks/use-categories";
import { getIcon } from "@/lib/icon-map";
import { formatCurrency } from "@/lib/utils";

type CategoryItem = Awaited<ReturnType<typeof useCategoriesQuery>>["data"] extends (infer T)[] | undefined
  ? T
  : never;

export default function CategoriasPage() {
  const { data: categories, isLoading } = useCategoriesQuery();
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = React.useState<CategoryItem | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize suas transações por categoria"
        action={
          <Button
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Nova categoria
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={Shapes}
          title="Nenhuma categoria cadastrada"
          description="Crie categorias para organizar melhor suas transações."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <Card key={category.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.transactionCount} transação(ões)
                    </p>
                    {category.monthlyBudget && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Orçamento: {formatCurrency(category.monthlyBudget)}
                      </p>
                    )}
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
                          setEditing(category);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => setDeleting(category)}
                      >
                        <Trash2 className="size-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={
          editing
            ? {
                id: editing.id,
                values: {
                  name: editing.name,
                  color: editing.color,
                  icon: editing.icon,
                  monthlyBudget: editing.monthlyBudget ?? undefined,
                },
              }
            : null
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir categoria?"
        description={`Tem certeza que deseja excluir "${deleting?.name}"?`}
        onConfirm={async () => {
          if (deleting) await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
