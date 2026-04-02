import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '@/lib/api/services/account.service';
import { useSession } from 'next-auth/react';
import {
  CreatePiggyGoalRequest,
  CreatePiggyGoalResponse,
} from '@/types/create-piggy-account';
import { piggyKeys } from '@/lib/queryKeys';

export const useCreatePiggyGoal = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<CreatePiggyGoalResponse, Error, CreatePiggyGoalRequest>({
    mutationFn: (data) =>
      accountService.createPiggyGoal(session!.accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['piggy-accounts'] });
      queryClient.invalidateQueries({ queryKey: piggyKeys.lists() });
    },
  });
};
