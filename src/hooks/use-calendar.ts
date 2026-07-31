"use client";

import { useQuery } from "@tanstack/react-query";
import { getCalendarMonthAction } from "@/app/(dashboard)/calendario/actions";

export function useCalendarMonthQuery(year: number, month: number) {
  return useQuery({
    queryKey: ["calendar", year, month],
    queryFn: () => getCalendarMonthAction(year, month),
  });
}
