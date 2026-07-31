"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TransactionFilters } from "@/lib/validations/transaction";
import type { TransactionInput } from "@/lib/validations/transaction";
import {
  listTransactionsAction,
  getTransactionFormOptionsAction,
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  createInstallmentPurchaseAction,
  createRecurringSubscriptionAction,
} from "@/app/(dashboard)/transacoes/actions";
import type { InstallmentPurchaseInput } from "@/lib/validations/installment-purchase";
import type { RecurringSubscriptionInput } from "@/lib/validations/recurring-subscription";

export function useTransactionsQuery(filters: Partial<TransactionFilters>) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => listTransactionsAction(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTransactionFormOptions() {
  return useQuery({
    queryKey: ["transaction-form-options"],
    queryFn: () => getTransactionFormOptionsAction(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionInput) => createTransactionAction(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Transação criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionInput }) =>
      updateTransactionAction(id, data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Transação atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionAction(id),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Transação excluída");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useCreateInstallmentPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InstallmentPurchaseInput) => createInstallmentPurchaseAction(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Compra parcelada criada — as parcelas já foram lançadas");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useCreateRecurringSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecurringSubscriptionInput) => createRecurringSubscriptionAction(data),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Assinatura recorrente criada");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
