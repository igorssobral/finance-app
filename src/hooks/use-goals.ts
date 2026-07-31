"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GoalInput } from "@/lib/validations/goal";
import {
  listGoalsAction,
  createGoalAction,
  updateGoalAction,
  deleteGoalAction,
} from "@/app/(dashboard)/metas/actions";

export function useGoalsQuery() {
  return useQuery({ queryKey: ["goals"], queryFn: () => listGoalsAction() });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalInput) => createGoalAction(data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Meta criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalInput }) => updateGoalAction(id, data),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Meta atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoalAction(id),
    onSuccess: (result) => {
      if (!result.success) return toast.error(result.error);
      toast.success("Meta excluída");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
