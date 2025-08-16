// src/hooks/use-invalidate-menus.tsx

import { getGetMenusForWeekQueryKey } from '@mono-repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Creates a reusable onSuccess handler for React Query mutations
 * that can optionally invalidate the menus-for-week query and log a message.
 *
 * @param message - The message to log when the mutation succeeds
 * @param currentWeekString - The week identifier string
 * @param invalidate - Whether to invalidate the menus query (default: true)
 */
export const useInvalidateMenusOnSuccess = (
  message: string,
  currentWeekString: string,
  invalidate: boolean = true
) => {
  const queryClient = useQueryClient();

  return {
    onSuccess: () => {
      if (invalidate) {
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      }
      console.log(message);
    },
  };
};
