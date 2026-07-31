"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AccountInput } from "@/lib/validations/account";
import {
  listAccountsAction,
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "@/app/(dashboard)/contas/actions";

export function useAccountsQuery() {
  return useQuery({ queryKey: ["accounts"], queryFn: () => listAccountsAction() });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AccountInput) => createAccountAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Conta criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountInput }) => updateAccountAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Conta atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccountAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(result.archived ? "Conta arquivada (havia transações vinculadas)" : "Conta excluída");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}
