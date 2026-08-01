"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Escolha como o Finance App aparece para você.</p>
      <div className="grid grid-cols-3 gap-3">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm transition-colors hover:bg-accent/50",
              mounted && theme === option.value && "border-primary bg-primary/5 text-primary",
            )}
          >
            <option.icon className="size-5" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
