import { transferService } from '@/lib/api/services/transfer.service';
import { piggyKeys } from '@/lib/queryKeys';
import { BreakPiggyRequest, BreakPiggyResponse } from '@/types/break-piggy';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useBreakPiggy = () => {
  const queryClient = useQueryClient();

  return useMutation<BreakPiggyResponse, Error, BreakPiggyRequest>({
    mutationFn: (data: BreakPiggyRequest) => transferService.breakPiggy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: piggyKeys.all });
    },
  });
};
