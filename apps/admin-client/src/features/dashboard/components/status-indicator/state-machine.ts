import { Reducer } from 'react';
import { Action, ActionType, PostState, State } from './types';

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
export const postStateMachine: Reducer<State, Action> = (
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
