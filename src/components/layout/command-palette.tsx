"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, ArrowLeftRight, Shapes, Landmark, CreditCard } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

/**
 * Pesquisa global de transações, categorias, contas e cartões (dados mockados
 * aqui — na Etapa 4/5 isso passa a consultar o backend via Server Action/TanStack
 * Query com debounce). Também funciona como navegador rápido entre páginas.
 */
export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function go(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-background/60 pt-24 backdrop-blur-sm animate-in fade-in-0"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        shouldFilter
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar transações, categorias, contas, cartões..."
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado.
          </Command.Empty>

          <Command.Group
            heading="Navegação"
            className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-1"
          >
            {NAV_ITEMS.map((item) => (
              <Command.Item
                key={item.href}
                value={item.title}
                onSelect={() => go(item.href)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm",
                  "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.title}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Ações rápidas"
            className="px-2 py-1.5 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-1"
          >
            <Command.Item
              value="Nova transação"
              onSelect={() => go("/transacoes")}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
            >
              <ArrowLeftRight className="size-4" />
              Nova transação
            </Command.Item>
            <Command.Item
              value="Nova categoria"
              onSelect={() => go("/categorias")}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
            >
              <Shapes className="size-4" />
              Nova categoria
            </Command.Item>
            <Command.Item
              value="Nova conta"
              onSelect={() => go("/contas")}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
            >
              <Landmark className="size-4" />
              Nova conta
            </Command.Item>
            <Command.Item
              value="Novo cartão"
              onSelect={() => go("/cartoes")}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm data-[selected=true]:bg-accent"
            >
              <CreditCard className="size-4" />
              Novo cartão
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
