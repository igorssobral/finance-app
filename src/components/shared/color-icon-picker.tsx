"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ICON_MAP, ICON_OPTIONS, COLOR_PALETTE, getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface ColorIconPickerProps {
  color: string;
  icon: string;
  onColorChange: (color: string) => void;
  onIconChange: (icon: string) => void;
}

/** Seletor combinado de cor + ícone — usado nos formulários de Categoria, Conta e Cartão. */
export function ColorIconPicker({ color, icon, onColorChange, onIconChange }: ColorIconPickerProps) {
  const SelectedIcon = getIcon(icon);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start gap-2"
        >
          <span
            className="flex size-6 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: color }}
          >
            <SelectedIcon className="size-3.5" />
          </span>
          Cor e ícone
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4">
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                className={cn(
                  "size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                  color === c && "ring-2 ring-foreground",
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ícone</Label>
          <div className="grid grid-cols-7 gap-1.5">
            {ICON_OPTIONS.map((name) => {
              const Icon = ICON_MAP[name];
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onIconChange(name)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-accent",
                    icon === name && "border-primary bg-primary/10 text-primary",
                  )}
                  aria-label={name}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
