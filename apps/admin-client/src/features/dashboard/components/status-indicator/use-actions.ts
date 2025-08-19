import {
  useScheduleWeek,
  useCancelScheduledWeek,
  getGetMenusForWeekQueryKey,
} from '@mono-repo/api-client';
import { Action, ActionType } from './types';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useWeekActions = (
  currentWeekString: string,
  dispatch: React.Dispatch<Action>
) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  const scheduleWeek = useScheduleWeek({
    mutation: {
      onSuccess: () => {
        dispatch({ type: ActionType.SCHEDULE });
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
      onError: () => dispatch({ type: ActionType.CANCEL }),
    },
  });

  const cancelScheduledWeek = useCancelScheduledWeek({
    mutation: {
      onSuccess: () => {
        dispatch({ type: ActionType.CANCEL });
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
      onError: () => dispatch({ type: ActionType.SCHEDULE }),
    },
  });

  const handleSchedule = async () => {
    setIsLoading(true);
    try {
      await scheduleWeek.mutateAsync({ weekNumber: currentWeekString });
    } catch (error) {
      console.error('Error scheduling week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelScheduledWeek.mutateAsync({
        weekNumber: currentWeekString,
      });
    } catch (error) {
      console.error('Error canceling scheduled week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSchedule,
    handleCancel,
    isLoading,
  };
};
