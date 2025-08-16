// src/hooks/use-invalidate-menus.ts

import { getGetMenusForWeekQueryKey } from '@mono-repo/api-client';
import { useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Creates a reusable onSuccess handler for React Query mutations that
 * invalidates the menus-for-week query and shows a success toast.
 *
 * @param message - The message for the success toast.
 * @param currentWeekString - The week identifier string for the query to invalidate.
 * @param invalidate - Whether to invalidate the menus query (default: true).
 * @returns An object with the `onSuccess` property for `useMutation` options.
 */
export const useInvalidateMenusOnSuccess = (
  message: string,
  currentWeekString: string,
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
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      }
      toast.success(message);
      console.log(message);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
      console.error('Mutation error:', error);
    },
  };
};
