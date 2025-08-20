import { Reducer } from 'react';
import { parseISO, getDay, addHours, isAfter } from 'date-fns';

import {
  Action,
  ActionType,
  ActionWithPayload,
  PostState,
  State,
} from './types';
import {
  WeekMenuResponseDto,
  WeekMenuResponseDtoWeekStatus,
} from '@mono-repo/api-client';

/**
 * @constant {State}
 * @description The initial state of our application.
 */
export const initialState: State = {
  status: PostState.Draft,
};

/**
 * @function postStateMachine
 * @description The reducer function that handles state transitions.
 * It takes the current state and an action, and returns the new state.
 * This is the core of the state machine.
 * @param {State} state - The current state.
 * @param {Action} action - The dispatched action.
 * @returns {State} The new state.
 */
export const postStateMachine: Reducer<State, ActionWithPayload> = (
  state,
  action
): State => {
  console.log(`Current State: ${state.status}, Action: ${action.type}`);
  switch (action.type) {
    case ActionType.INITIALIZE_DRAFT:
      return { ...state, status: PostState.Draft };
    case ActionType.INITIALIZE_SCHEDULED:
      return { ...state, status: PostState.Scheduled };
    case ActionType.INITIALIZE_OVERDUE:
      return { ...state, status: PostState.Overdue };
    case ActionType.INITIALIZE_PUBLISHED:
      return { ...state, status: PostState.Published };
    case ActionType.INITIALIZE_FAILED_SEE_DETAILS:
      return { ...state, status: PostState.Failed_SeeDetails };
    case ActionType.INITIALIZE_FAILED_ONE_TIME_RETRY:
      return { ...state, status: PostState.Failed_OneTimeRetry };
    case ActionType.INITIALIZE_MISSED_DEADLINE:
      return { ...state, status: PostState.Missed_Deadline };
    case ActionType.INITIALIZE_CANNOT_SCHEDULE_CLOSED:
      return { ...state, status: PostState.CannotSchedule_Closed };
    case ActionType.INITIALIZE_CANNOT_SCHEDULE_NOTHING:
      return { ...state, status: PostState.CannotSchedule_Nothing };
    case ActionType.LOADING:
      return { ...state, status: PostState.Loading };

    case ActionType.SET_STATE: {
      const weekData = action.payload;

      // Determine the new state based on the week data
      const newState = determinePostState({
        isLoading: false,
        weekData,
        now: new Date(),
      });

      return { ...state, status: newState };
    }
  }

  switch (state.status) {
    case PostState.Draft:
      switch (action.type) {
        case ActionType.SCHEDULE:
          return { ...state, status: PostState.Scheduled };
        case ActionType.DEADLINE_PASSES:
          return { ...state, status: PostState.Overdue };
        default:
          return state;
      }

    case PostState.Scheduled:
      switch (action.type) {
        case ActionType.CANCEL_SCHEDULED:
          return { ...state, status: PostState.Draft };
        case ActionType.POST_SUCCESS:
          return { ...state, status: PostState.Published };
        case ActionType.POST_FAILURE:
          return { ...state, status: PostState.Failed_SeeDetails };
        default:
          return state;
      }

    case PostState.Overdue:
      switch (action.type) {
        case ActionType.SCHEDULE:
          return { ...state, status: PostState.Scheduled };
        case ActionType.SYSTEM_AUTO_FAIL:
          return { ...state, status: PostState.Failed_OneTimeRetry };
        case ActionType.TOLERANCE_EXPIRES:
          return { ...state, status: PostState.Missed_Deadline };
        default:
          return state;
      }

    case PostState.Failed_OneTimeRetry:
      switch (action.type) {
        case ActionType.RETRY:
          return { ...state, status: PostState.Scheduled };
        case ActionType.TOLERANCE_EXPIRES:
          return { ...state, status: PostState.Missed_Deadline };
        default:
          return state;
      }

    // Terminal states - they don't transition to other states based on these actions
    case PostState.Missed_Deadline:
    case PostState.Published:
    case PostState.Failed_SeeDetails:
    case PostState.CannotSchedule_Closed:
    case PostState.CannotSchedule_Nothing:

    default:
      // Handle reset from any state
      if (action.type === ActionType.RESET) {
        return initialState;
      }
      return state;
  }
};

// --- Configuration ---
// Define the deadline for the planning week as a day of the week (Sunday = 0, Saturday = 6)
const DEADLINE_DAY = 0; // Sunday
const DEADLINE_HOUR = 17; // 5:00 PM
const RETRY_TOLERANCE_HOURS = 1; // 1-hour tolerance period for retries

/**
 * Determines the UI state for a given week based on its data and the current time.
 * @param params - The parameters for determining the state.
 * @param params.isLoading - Boolean flag indicating if data is being fetched.
 * @param params.weekData - The data object for the week, received from the backend.
 * @param params.now - The current Date object, passed in for testability.
 * @returns The calculated PostState.
 */
export function determinePostState({
  isLoading,
  weekData,
  now = new Date(),
}: {
  isLoading: boolean;
  weekData?: WeekMenuResponseDto;
  now?: Date;
}): PostState {
  // 1. Handle the loading state first.
  if (isLoading) {
    return PostState.Loading;
  }

  // 2. If loading is finished but we have no data, it's a failure.
  if (!weekData) {
    return PostState.Failed_SeeDetails;
  }

  const {
    weekStatus,
    isPast,
    isCurrentWeek,
    isPlanningWeek,
    isEmpty,
    weekEnd,
  } = weekData;

  // 3. Evaluate state based on the weekStatus from the backend.
  switch (weekStatus) {
    case WeekMenuResponseDtoWeekStatus.DRAFT:
      // If a draft is in the past, it's a missed state.
      if (isPast) {
        return isEmpty
          ? PostState.CannotSchedule_Closed // Empty and in the past
          : PostState.Missed_Deadline; // Had content but was never scheduled
      }

      // If it's a future week (not current or planning) and empty.
      if (!isCurrentWeek && !isPlanningWeek && isEmpty) {
        return PostState.CannotSchedule_Nothing;
      }

      // Overdue: If it's the planning week, still a draft, and we are on the weekend of the *current* week.
      // getDay() -> Sunday = 0, Saturday = 6
      if (isPlanningWeek && (getDay(now) === 0 || getDay(now) === 6)) {
        return PostState.Overdue;
      }

      // The standard "Draft" state for a non-empty planning week.
      if (isPlanningWeek && !isEmpty) {
        return PostState.Draft;
      }

      // Fallback for any other DRAFT case (e.g., future week with content).
      return PostState.Draft;

    case WeekMenuResponseDtoWeekStatus.SCHEDULED:
      // A scheduled post for the current or past week is an error state.
      if (isCurrentWeek || isPast) {
        console.error(
          `Error: Week ending ${weekEnd} has status SCHEDULED but is in the past or present.`
        );
        return PostState.Failed_SeeDetails;
      }
      // Otherwise, it's correctly scheduled for the future.
      return PostState.Scheduled;

    case WeekMenuResponseDtoWeekStatus.PUBLISHED:
      // Published is a final, valid state for any week.
      return PostState.Published;

    case WeekMenuResponseDtoWeekStatus.FAILED:
      // Check for the one-time retry condition for the planning week.
      if (isPlanningWeek) {
        // We define the "deadline" as the end of the *previous* week (i.e., the current week's Sunday).
        // Since weekData.weekStart is for the planning week, its previous day is the deadline.
        const deadline = parseISO(weekData.weekStart);
        deadline.setHours(DEADLINE_HOUR, 0, 0, 0); // Set to 5 PM on the day before planning starts

        const retryWindowEnd = addHours(deadline, RETRY_TOLERANCE_HOURS);

        // If the current time is after the deadline but before the tolerance window ends.
        if (isAfter(now, deadline) && isAfter(retryWindowEnd, now)) {
          return PostState.Failed_OneTimeRetry;
        }
      }
      // For all other failure scenarios, show the details.
      return PostState.Failed_SeeDetails;

    default:
      // If the backend provides an unknown status, treat it as an error.
      console.warn(`Unknown weekStatus received: ${weekStatus}`);
      return PostState.Failed_SeeDetails;
  }
}
