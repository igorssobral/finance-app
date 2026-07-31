"use server";

import { auth } from "@/lib/auth";
import { getCalendarMonth } from "@/services/calendar-service";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function getCalendarMonthAction(year: number, month: number) {
  const userId = await requireUserId();
  return getCalendarMonth(userId, year, month);
}
