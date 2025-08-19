/**
 * @enum {string}
 * @description Defines all possible states for our component.
 * Using an enum makes it easy to reference states without typos.
 */
export enum PostState {
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
  SCHEDULE = 'SCHEDULE',
  CANCEL = 'CANCEL',
  //   LOADING = 'LOADING',
  DEADLINE_PASSES = 'DEADLINE_PASSES',
  POST_SUCCESS = 'POST_SUCCESS',
  POST_FAILURE = 'POST_FAILURE',
  SYSTEM_AUTO_FAIL = 'SYSTEM_AUTO_FAIL',
  RETRY = 'RETRY',
  TOLERANCE_EXPIRES = 'TOLERANCE_EXPIRES',
  SYSTEM_CLOSE = 'SYSTEM_CLOSE',
  // A simple reset action for demonstration purposes
  RESET = 'RESET',
}

/**
 * @interface State
 * @description Represents the shape of our state object.
 * @property {PostState} status - The current state of the post.
 */
export interface State {
  status: PostState;
  isLoading: boolean;
}

/**
 * @interface Action
 * @description Represents the shape of the actions we can dispatch.
 * @property {ActionType} type - The type of the action.
 */
export interface Action {
  type: ActionType;
}
