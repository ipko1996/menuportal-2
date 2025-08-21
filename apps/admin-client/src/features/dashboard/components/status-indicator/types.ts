import { WeekMenuResponseDto } from '@mono-repo/api-client';

/**
 * @enum {string}
 * @description Defines all possible states for our component.
 * Using an enum makes it easy to reference states without typos.
 */
export enum PostState {
  Loading = 'Loading',
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Overdue = 'Overdue',
  Published = 'Published',
  Failed_SeeDetails = 'Failed_SeeDetails',
  Failed_OneTimeRetry = 'Failed_OneTimeRetry',
  Missed_Deadline = 'Missed_Deadline',
  CannotSchedule_Closed = 'CannotSchedule_Closed',
  CannotSchedule_Nothing = 'CannotSchedule_Nothing',
}

/**
 * @enum {string}
 * @description Defines all possible actions that can be dispatched to change the state.
 */
export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_STATE = 'SET_STATE',
}

/**
 * @interface State
 * @description Represents the shape of our state object.
 * @property {PostState} status - The current state of the post.
 */

export interface NewState {
  status: PostState;
  payload?: WeekMenuResponseDto;
}

/**
 * @interface Action
 * @description Represents the shape of the actions we can dispatch.
 * @property {ActionType} type - The type of the action.
 */

export type ActionWithPayload = {
  type: ActionType;
  payload?: WeekMenuResponseDto;
};

export type Action = ActionWithPayload;
