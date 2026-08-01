import {
  Utensils,
  Car,
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  PartyPopper,
  Home,
  ShoppingBag,
  Tv,
  Plane,
  TrendingUp,
  Banknote,
  Briefcase,
  Shapes,
  Wallet,
  Landmark,
  CreditCard,
  Smartphone,
  PiggyBank,
  Coins,
  Gift,
  Dumbbell,
  Dog,
  Baby,
  Fuel,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Ícones disponíveis para seleção em Categorias, Contas e Cartões. */
export const ICON_MAP = {
  utensils: Utensils,
  car: Car,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  "shopping-cart": ShoppingCart,
  "party-popper": PartyPopper,
  home: Home,
  "shopping-bag": ShoppingBag,
  tv: Tv,
  plane: Plane,
  "trending-up": TrendingUp,
  banknote: Banknote,
  briefcase: Briefcase,
  shapes: Shapes,
  wallet: Wallet,
  landmark: Landmark,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  "piggy-bank": PiggyBank,
  coins: Coins,
  gift: Gift,
  dumbbell: Dumbbell,
  dog: Dog,
  baby: Baby,
  fuel: Fuel,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export const ICON_OPTIONS = Object.keys(ICON_MAP) as Array<keyof typeof ICON_MAP>;

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) {
    return Shapes;
  }

  return ICON_MAP[name as keyof typeof ICON_MAP] ?? Shapes;
}

/** Paleta curada de cores para categorias, contas e cartões (hex). */
export const COLOR_PALETTE = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#22c55e", // green
  "#a855f7", // purple
  "#14b8a6", // teal
  "#71717a", // zinc
];
