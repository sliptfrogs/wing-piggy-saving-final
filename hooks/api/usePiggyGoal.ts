import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { piggyService } from '@/lib/api/services/piggy.service';
import { piggyKeys } from '@/lib/queryKeys';
import { PiggyGoal, CreatePiggyRequest } from '@/lib/types/piggy';
import { PiggyGoalDetail } from '@/types/piggy-goal-detail';

/**
 * Fetch all piggy goals for the current user (list page).
 */
export const usePiggyGoals = () => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery<PiggyGoalDetail[]>({
    queryKey: piggyKeys.lists(),
    queryFn: () => piggyService.getAll(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single piggy goal by its associated account number (detail page).
 */
export const usePiggyGoalByAccountNumber = (accountNumber: string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery<PiggyGoalDetail>({
    queryKey: piggyKeys.byAccount(accountNumber),
    queryFn: () => piggyService.getByAccountNumber(token!, accountNumber),
    enabled: !!token && !!accountNumber,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new piggy goal.
 */
export const useCreatePiggyGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePiggyRequest) => piggyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: piggyKeys.lists() });
    },
  });
};
