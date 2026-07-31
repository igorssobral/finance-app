"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CardInput } from "@/lib/validations/card";
import {
  listCardsAction,
  getCardDetailAction,
  createCardAction,
  updateCardAction,
  deleteCardAction,
} from "@/app/(dashboard)/cartoes/actions";

export function useCardsQuery() {
  return useQuery({ queryKey: ["cards"], queryFn: () => listCardsAction() });
}

export function useCardDetailQuery(cardId: string | null) {
  return useQuery({
    queryKey: ["card-detail", cardId],
    queryFn: () => getCardDetailAction(cardId!),
    enabled: !!cardId,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CardInput) => createCardAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Cartão criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardInput }) => updateCardAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Cartão atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCardAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success(result.archived ? "Cartão arquivado (havia transações vinculadas)" : "Cartão excluído");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}
