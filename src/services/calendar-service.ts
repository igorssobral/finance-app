import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, getDate, isSameMonth } from "date-fns";
import { getOpenCardInvoiceTotal } from "@/lib/repositories/account-repository";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export type CalendarEventType = "income" | "expense" | "card-due" | "subscription" | "investment";

export interface CalendarEvent {
  type: CalendarEventType;
  label: string;
  amount: number;
}

export interface CalendarDay {
  day: number;
  date: Date;
  events: CalendarEvent[];
  totalIncome: number;
  totalExpense: number;
}

export async function getCalendarMonth(userId: string, year: number, month: number): Promise<CalendarDay[]> {
  const reference = new Date(year, month, 1);
  const start = startOfMonth(reference);
  const end = endOfMonth(reference);

  const [transactions, cards, subscriptions, investments, cardInvoice] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { title: true, amount: true, type: true, date: true },
    }),
    prisma.card.findMany({ where: { userId, archived: false }, select: { id: true, name: true, dueDay: true } }),
    prisma.recurringSubscription.findMany({
      where: { userId, active: true, nextChargeDate: { gte: start, lte: end } },
      select: { name: true, amount: true, nextChargeDate: true },
    }),
    prisma.investment.findMany({
      where: { userId, purchaseDate: { gte: start, lte: end } },
      select: { name: true, investedAmount: true, purchaseDate: true },
    }),
    getOpenCardInvoiceTotal(userId),
  ]);

  const days: CalendarDay[] = Array.from({ length: end.getDate() }, (_, i) => ({
    day: i + 1,
    date: new Date(year, month, i + 1),
    events: [],
    totalIncome: 0,
    totalExpense: 0,
  }));

  for (const t of transactions) {
    if (!isSameMonth(t.date, reference)) continue;
    const day = days[getDate(t.date) - 1];
    const amount = toNumber(t.amount);
    if (t.type === "INCOME") {
      day.totalIncome += amount;
      day.events.push({ type: "income", label: t.title, amount });
    } else {
      day.totalExpense += amount;
      day.events.push({ type: "expense", label: t.title, amount });
    }
  }

  for (const card of cards) {
    if (card.dueDay > end.getDate()) continue;
    const day = days[card.dueDay - 1];
    const cardTotal = cardInvoice.cards.find((c) => c.cardId === card.id)?.invoiceTotal ?? 0;
    day.events.push({ type: "card-due", label: `Fatura ${card.name}`, amount: cardTotal });
  }

  for (const sub of subscriptions) {
    const day = days[getDate(sub.nextChargeDate) - 1];
    day.events.push({ type: "subscription", label: sub.name, amount: toNumber(sub.amount) });
  }

  for (const inv of investments) {
    const day = days[getDate(inv.purchaseDate) - 1];
    day.events.push({ type: "investment", label: inv.name, amount: toNumber(inv.investedAmount) });
  }

  return days;
}
