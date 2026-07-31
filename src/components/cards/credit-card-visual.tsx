import { CreditCard } from "lucide-react";
import { CARD_BRANDS } from "@/lib/validations/card";
import { formatCurrency } from "@/lib/utils";

interface CreditCardVisualProps {
  name: string;
  brand: string;
  color: string;
  limit: number;
  availableLimit: number;
  onClick?: () => void;
}

export function CreditCardVisual({
  name,
  brand,
  color,
  limit,
  availableLimit,
  onClick,
}: CreditCardVisualProps) {
  const usedPercent = limit > 0 ? Math.min(100, Math.round(((limit - availableLimit) / limit) * 100)) : 0;
  const brandLabel = CARD_BRANDS.find((b) => b.value === brand)?.label ?? brand;

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl p-5 text-left text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 60%, #000 150%)`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium opacity-90">{name}</span>
        <CreditCard className="size-5 opacity-80" />
      </div>

      <div className="absolute bottom-5 left-5 right-5 space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide opacity-70">Limite disponível</p>
            <p className="text-lg font-semibold">{formatCurrency(availableLimit)}</p>
          </div>
          <span className="text-xs font-medium uppercase opacity-80">{brandLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white/90" style={{ width: `${usedPercent}%` }} />
        </div>
      </div>
    </button>
  );
}
