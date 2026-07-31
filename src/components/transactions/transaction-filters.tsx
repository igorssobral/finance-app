"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { useTransactionFormOptions } from "@/hooks/use-transactions";
import type { TransactionFilters } from "@/lib/validations/transaction";

interface TransactionFiltersBarProps {
  filters: Partial<TransactionFilters>;
  onChange: (filters: Partial<TransactionFilters>) => void;
}

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersBarProps) {
  const { data: options } = useTransactionFormOptions();
  const [search, setSearch] = React.useState(filters.search ?? "");
  const debouncedSearch = useDebounce(search, 350);

  React.useEffect(() => {
    onChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeAdvancedFilters =
    (filters.minAmount ? 1 : 0) +
    (filters.maxAmount ? 1 : 0) +
    (filters.onlyRecurring ? 1 : 0) +
    (filters.onlyInstallment ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.type ?? "ALL"}
        onValueChange={(value) =>
          onChange({ ...filters, type: value === "ALL" ? undefined : (value as "INCOME" | "EXPENSE"), page: 1 })
        }
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os tipos</SelectItem>
          <SelectItem value="INCOME">Receitas</SelectItem>
          <SelectItem value="EXPENSE">Despesas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId ?? "ALL"}
        onValueChange={(value) => onChange({ ...filters, categoryId: value === "ALL" ? undefined : value, page: 1 })}
      >
        <SelectTrigger className="w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas categorias</SelectItem>
          {options?.categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.accountId ?? "ALL"}
        onValueChange={(value) => onChange({ ...filters, accountId: value === "ALL" ? undefined : value, page: 1 })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Conta" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas contas</SelectItem>
          {options?.accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.cardId ?? "ALL"}
        onValueChange={(value) => onChange({ ...filters, cardId: value === "ALL" ? undefined : value, page: 1 })}
      >
        <SelectTrigger className="w-36"><SelectValue placeholder="Cartão" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos cartões</SelectItem>
          {options?.cards.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="size-4" />
            Mais filtros
            {activeAdvancedFilters > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeAdvancedFilters}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-4">
          <div className="space-y-2">
            <Label>Faixa de valor</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Mín."
                value={filters.minAmount ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined, page: 1 })
                }
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                placeholder="Máx."
                value={filters.maxAmount ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined, page: 1 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Período</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  onChange({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined, page: 1 })
                }
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="date"
                value={filters.dateTo ? new Date(filters.dateTo).toISOString().slice(0, 10) : ""}
                onChange={(e) =>
                  onChange({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined, page: 1 })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="onlyRecurring"
              checked={!!filters.onlyRecurring}
              onCheckedChange={(checked) => onChange({ ...filters, onlyRecurring: !!checked, page: 1 })}
            />
            <Label htmlFor="onlyRecurring" className="font-normal">Apenas recorrentes</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="onlyInstallment"
              checked={!!filters.onlyInstallment}
              onCheckedChange={(checked) => onChange({ ...filters, onlyInstallment: !!checked, page: 1 })}
            />
            <Label htmlFor="onlyInstallment" className="font-normal">Apenas parceladas</Label>
          </div>
        </PopoverContent>
      </Popover>

      {(filters.type || filters.categoryId || filters.accountId || filters.cardId || activeAdvancedFilters > 0 || filters.search) && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground"
          onClick={() => {
            setSearch("");
            onChange({ page: 1, pageSize: filters.pageSize });
          }}
        >
          <X className="size-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
