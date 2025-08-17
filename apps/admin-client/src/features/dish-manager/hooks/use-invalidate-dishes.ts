import { getGetPaginatedDishesQueryKey } from '@mono-repo/api-client';
import { useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvalidateDishes = (
  message: string,
  invalidate = true
): Pick<
  UseMutationOptions<unknown, Error, unknown>,
  'onSuccess' | 'onError'
> => {
  const queryClient = useQueryClient();

  return {
    onSuccess: () => {
      if (invalidate) {
        queryClient.invalidateQueries({
          queryKey: getGetPaginatedDishesQueryKey(),
        });
      }
      toast.success(message);
      console.log('Success:', message);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      console.error('Error:', error);
    },
  };
};
