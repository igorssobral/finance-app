"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CategoryInput } from "@/lib/validations/category";
import {
  listCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/(dashboard)/categorias/actions";

export function useCategoriesQuery() {
  return useQuery({ queryKey: ["categories"], queryFn: () => listCategoriesAction() });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => createCategoryAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Categoria criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryInput }) => updateCategoryAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Categoria atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategoryAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Categoria excluída");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-form-options"] });
    },
  });
}
