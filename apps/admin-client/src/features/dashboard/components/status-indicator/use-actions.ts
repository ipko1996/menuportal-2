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

  const scheduleWeek = useScheduleWeek({
    mutation: {
      // onMutate: () => {
      //   dispatch({ type: ActionType.LOADING });
      // },
      onSuccess: () => {
        dispatch({ type: ActionType.SCHEDULE });
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
      // onError: () => dispatch({ type: ActionType.CANCEL_SCHEDULED }),
    },
  });

  const cancelScheduledWeek = useCancelScheduledWeek({
    mutation: {
      // onMutate: () => {
      //   dispatch({ type: ActionType.LOADING });
      // },
      onSuccess: () => {
        dispatch({ type: ActionType.CANCEL_SCHEDULED });
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
      // onError: () => dispatch({ type: ActionType.SCHEDULE }),
    },
  });

  const handleSchedule = async () => {
    try {
      await scheduleWeek.mutateAsync({ weekNumber: currentWeekString });
    } catch (error) {
      console.error('Error scheduling week:', error);
    } finally {
    }
  };

  const handleCancel = async () => {
    try {
      await cancelScheduledWeek.mutateAsync({
        weekNumber: currentWeekString,
      });
    } catch (error) {
      console.error('Error canceling scheduled week:', error);
    } finally {
    }
  };

  return {
    handleSchedule,
    handleCancel,
    isScheduling: scheduleWeek.isPending,
    isCancelling: cancelScheduledWeek.isPending,
  };
};
