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

export const usePiggyGoalsByUserIdAndStatus = (status: string) => {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: ['piggy-goals-status'],
    queryFn: () => piggyService.getAllByUserIdAndPiggyStatus(status),
    enabled: !!token && !!status,
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
    staleTime: 0,
    refetchInterval: 5000,
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

/**
 * Update a piggy to public.
 */
export const useUpdatePiggyPublic = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { accountNumber: string; isPublic: boolean }) =>
      piggyService.update_public(session!.accessToken!, data.accountNumber, {
        is_public: data.isPublic,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: piggyKeys.byAccount(variables.accountNumber),
      });
      queryClient.invalidateQueries({ queryKey: piggyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['piggy-goals-status'] });
    },
  });
};
