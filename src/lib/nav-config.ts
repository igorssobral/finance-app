import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Shapes,
  Landmark,
  CreditCard,
  Target,
  TrendingUp,
  PiggyBank,
  FileBarChart,
  CalendarDays,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transações", href: "/transacoes", icon: ArrowLeftRight },
  { title: "Categorias", href: "/categorias", icon: Shapes },
  { title: "Contas", href: "/contas", icon: Landmark },
  { title: "Cartões", href: "/cartoes", icon: CreditCard },
  { title: "Metas", href: "/metas", icon: Target },
  { title: "Investimentos", href: "/investimentos", icon: TrendingUp },
  { title: "Orçamentos", href: "/orcamentos", icon: PiggyBank },
  { title: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { title: "Calendário", href: "/calendario", icon: CalendarDays },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];
