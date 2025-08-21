import {
  useScheduleWeek,
  useCancelScheduledWeek,
  getGetMenusForWeekQueryKey,
} from '@mono-repo/api-client';
import { Action, ActionType } from './types';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useWeekActions = (
  currentWeekString: string
  // dispatch: React.Dispatch<Action>
) => {
  const queryClient = useQueryClient();

  const scheduleWeek = useScheduleWeek({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
    },
  });

  const cancelScheduledWeek = useCancelScheduledWeek({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetMenusForWeekQueryKey(currentWeekString),
        });
      },
    },
  });

  const handleSchedule = async () => {
    try {
      await scheduleWeek.mutateAsync({ weekNumber: currentWeekString });
    } catch (error) {
      console.error('Error scheduling week:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelScheduledWeek.mutateAsync({
        weekNumber: currentWeekString,
      });
    } catch (error) {
      console.error('Error canceling scheduled week:', error);
    }
  };

  return {
    handleSchedule,
    handleCancel,
    isScheduling: scheduleWeek.isPending,
    isCancelling: cancelScheduledWeek.isPending,
  };
};
