"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BudgetInput } from "@/lib/validations/budget";
import {
  listBudgetsAction,
  createBudgetAction,
  updateBudgetAction,
  deleteBudgetAction,
} from "@/app/(dashboard)/orcamentos/actions";

export function useBudgetsQuery() {
  return useQuery({ queryKey: ["budgets"], queryFn: () => listBudgetsAction() });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetInput) => createBudgetAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Orçamento criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetInput }) => updateBudgetAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Orçamento atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudgetAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Orçamento excluído");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}
