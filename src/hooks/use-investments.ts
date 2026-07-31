"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InvestmentInput } from "@/lib/validations/investment";
import {
  getInvestmentDashboardAction,
  createInvestmentAction,
  updateInvestmentAction,
  deleteInvestmentAction,
} from "@/app/(dashboard)/investimentos/actions";

export function useInvestmentDashboardQuery() {
  return useQuery({ queryKey: ["investments"], queryFn: () => getInvestmentDashboardAction() });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InvestmentInput) => createInvestmentAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Investimento criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvestmentInput }) => updateInvestmentAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Investimento atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvestmentAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Investimento excluído");
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}
