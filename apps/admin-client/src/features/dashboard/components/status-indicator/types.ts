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
  SCHEDULE = 'SCHEDULE',
  CANCEL_SCHEDULED = 'CANCEL_SCHEDULED',
  LOADING = 'LOADING',
  DEADLINE_PASSES = 'DEADLINE_PASSES',
  POST_SUCCESS = 'POST_SUCCESS',
  POST_FAILURE = 'POST_FAILURE',
  SYSTEM_AUTO_FAIL = 'SYSTEM_AUTO_FAIL',
  RETRY = 'RETRY',
  TOLERANCE_EXPIRES = 'TOLERANCE_EXPIRES',
  // A simple reset action for demonstration purposes
  RESET = 'RESET',

  INITIALIZE_DRAFT = 'INITIALIZE_DRAFT',
  INITIALIZE_SCHEDULED = 'INITIALIZE_SCHEDULED',
  INITIALIZE_OVERDUE = 'INITIALIZE_OVERDUE',
  INITIALIZE_PUBLISHED = 'INITIALIZE_PUBLISHED',
  INITIALIZE_FAILED_SEE_DETAILS = 'INITIALIZE_FAILED_SEE_DETAILS',
  INITIALIZE_FAILED_ONE_TIME_RETRY = 'INITIALIZE_FAILED_ONE_TIME_RETRY',
  INITIALIZE_MISSED_DEADLINE = 'INITIALIZE_MISSED_DEADLINE',
  INITIALIZE_CANNOT_SCHEDULE_CLOSED = 'INITIALIZE_CANNOT_SCHEDULE_CLOSED',
  INITIALIZE_CANNOT_SCHEDULE_NOTHING = 'INITIALIZE_CANNOT_SCHEDULE_NOTHING',
}

/**
 * @interface State
 * @description Represents the shape of our state object.
 * @property {PostState} status - The current state of the post.
 */
export interface State {
  status: PostState;
}

/**
 * @interface Action
 * @description Represents the shape of the actions we can dispatch.
 * @property {ActionType} type - The type of the action.
 */
export interface Action {
  type: ActionType;
}
