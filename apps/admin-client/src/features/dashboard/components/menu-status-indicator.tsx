'use client';

import type { WeekMenuResponseDtoWeekStatus } from '@mono-repo/api-client';
import {
  Clock,
  X,
  Send,
  Calendar,
  FileText,
  Eye,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { Button } from '@mono-repo/ui';
import { ReactNode } from 'react';
import { Action, ActionType, PostState, State } from './status-indicator/types';

const mockViewPublished = (weekNumber: string) => {
  console.log(`ACTION: Viewing published menu for week ${weekNumber}`);
  alert(`Viewing published menu for week ${weekNumber}`);
};

interface MenuStatusCardProps {
  statusConfig: {
    label: string;
    icon: React.ElementType;
    bgColor: string;
    borderColor: string;
    iconContainerClasses: string;
    textColor: string;
  };
  weekNumber: string;
  isLoading: boolean;
  children: ReactNode;
  statusText?: string;
  statusTextColor?: string;
}

export const MenuStatusCard: React.FC<MenuStatusCardProps> = ({
  statusConfig,
  weekNumber,
  children,
  statusText,
  statusTextColor,
  isLoading,
}) => {
  const {
    label,
    icon: StatusIcon,
    bgColor,
    borderColor,
    iconContainerClasses,
    textColor,
  } = statusConfig;
  return (
    <div
      className={`w-full max-w-lg mx-auto flex items-center justify-between px-3 py-2 rounded-lg border shadow-sm h-14 transition-all duration-300 ${bgColor} ${borderColor}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${iconContainerClasses}`}>
          <StatusIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col h-10 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Menu Status
            </span>
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
              Week {weekNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${textColor}`}>{label}</span>
            {statusText && (
              <span
                className={`text-xs font-medium ${
                  statusTextColor || textColor
                }`}
              >
                {statusText}
              </span>
            )}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

const stateUIConfig = {
  [PostState.Draft]: {
    label: 'Draft',
    icon: FileText,
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconContainerClasses:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
  },
  [PostState.Overdue]: {
    label: 'Draft',
    icon: FileText,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-300 dark:border-yellow-600',
    iconContainerClasses:
      'bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-800 dark:text-yellow-100 dark:border-yellow-600',
    textColor: 'text-yellow-800 dark:text-yellow-100',
  },
  [PostState.Scheduled]: {
    label: 'Scheduled',
    icon: Clock,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-700',
    iconContainerClasses:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-600',
    textColor: 'text-blue-800 dark:text-blue-100',
  },
  [PostState.Published]: {
    label: 'Published',
    icon: Eye,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-700',
    iconContainerClasses:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-600',
    textColor: 'text-green-800 dark:text-green-100',
  },
  [PostState.Failed_OneTimeRetry]: {
    label: 'Failed',
    icon: AlertTriangle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-700',
    iconContainerClasses:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-600',
    textColor: 'text-red-800 dark:text-red-100',
  },
  [PostState.CannotSchedule_Closed]: {
    label: 'Draft',
    icon: X,
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    iconContainerClasses:
      'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
  },
  [PostState.Failed_SeeDetails]: {
    label: 'Failed',
    icon: Settings,
    bgColor: 'bg-red-100 dark:bg-red-800',
    borderColor: 'border-red-300 dark:border-red-600',
    iconContainerClasses:
      'bg-red-200 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-200 dark:border-red-600',
    textColor: 'text-red-700 dark:text-red-200',
  },
  [PostState.Missed_Deadline]: {
    label: 'Missed Deadline',
    icon: AlertTriangle,
    bgColor: 'bg-gray-200 dark:bg-gray-800',
    borderColor: 'border-gray-400 dark:border-gray-600',
    iconContainerClasses:
      'bg-gray-300 text-gray-800 border-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    textColor: 'text-gray-800 dark:text-gray-200',
  },
  [PostState.CannotSchedule_Nothing]: {
    label: 'Nothing to Schedule',
    icon: FileText,
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconContainerClasses:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
  },
};

interface StateComponentProps {
  state: State;
  dispatch: React.Dispatch<Action>;
  actions: {
    handleSchedule: () => Promise<void>;
    handleCancel: () => Promise<void>;
    isLoading: boolean;
  };
}

export const stateComponentMap: Record<
  PostState,
  React.FC<StateComponentProps>
> = {
  [PostState.Draft]: ({ state, dispatch, actions }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Draft}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
    >
      <Button
        onClick={() => actions.handleSchedule()}
        disabled={state.isLoading}
        className="btn bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {state.isLoading ? (
          <>
            <Clock className="h-3 w-3 mr-1 animate-spin" /> Scheduling...
          </>
        ) : (
          <>
            <Send className="h-3 w-3 mr-1" /> Schedule
          </>
        )}
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Overdue]: ({ state, dispatch }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Overdue}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
      statusText="Needs scheduling"
    >
      <Button
        onClick={() => dispatch({ type: ActionType.SCHEDULE })}
        disabled={state.isLoading}
        className="btn bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        {state.isLoading ? (
          <>
            <Clock className="h-3 w-3 mr-1 animate-spin" /> Scheduling...
          </>
        ) : (
          <>
            <Send className="h-3 w-3 mr-1" /> Schedule Now
          </>
        )}
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Scheduled]: ({ state, dispatch, actions }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Scheduled}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
      statusText="Posts Mon 9 AM"
      statusTextColor="text-blue-700 dark:text-blue-300"
    >
      <Button
        onClick={() => actions.handleCancel()}
        disabled={state.isLoading}
        className="btn bg-red-600 hover:bg-red-700 text-white"
      >
        {state.isLoading ? (
          <>
            <X className="h-3 w-3 mr-1 animate-spin" /> Canceling...
          </>
        ) : (
          <>
            <X className="h-3 w-3 mr-1" /> Cancel
          </>
        )}
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Published]: ({ state }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Published}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
    >
      <Button
        onClick={() => mockViewPublished(state.weekNumber)}
        className="btn bg-green-600 hover:bg-green-700 text-white"
      >
        <Eye className="h-3 w-3 mr-1" /> View Published
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Failed_OneTimeRetry]: ({ state, dispatch }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Failed_OneTimeRetry}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
    >
      <Button
        onClick={() => dispatch({ type: ActionType.RETRY })}
        disabled={state.isLoading}
        className="btn bg-orange-600 hover:bg-orange-700 text-white"
      >
        {state.isLoading ? (
          <>
            <Clock className="h-3 w-3 mr-1 animate-spin" /> Retrying...
          </>
        ) : (
          <>
            <Send className="h-3 w-3 mr-1" /> Try Again
          </>
        )}
      </Button>
    </MenuStatusCard>
  ),
  [PostState.CannotSchedule_Closed]: ({ state }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.CannotSchedule_Closed}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
      statusText="Scheduling closed"
    >
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium px-4">
        Cannot schedule
      </span>
    </MenuStatusCard>
  ),
  [PostState.Failed_SeeDetails]: ({ state, dispatch }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Failed_SeeDetails}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
    >
      <Button
        onClick={() => dispatch({ type: ActionType.RESET })}
        className="btn bg-red-600 hover:bg-red-700 text-white"
      >
        <Settings className="h-3 w-3 mr-1" /> Reset
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Missed_Deadline]: ({ state, dispatch }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Missed_Deadline}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
      statusText="Final deadline passed"
    >
      <Button
        onClick={() => dispatch({ type: ActionType.SYSTEM_CLOSE })}
        className="btn bg-gray-600 hover:bg-gray-700 text-white"
      >
        <Settings className="h-3 w-3 mr-1" /> System Action
      </Button>
    </MenuStatusCard>
  ),
  [PostState.CannotSchedule_Nothing]: ({ state, dispatch }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.CannotSchedule_Nothing}
      weekNumber={state.weekNumber}
      isLoading={state.isLoading}
      statusText="Nothing to schedule"
    >
      <Button
        onClick={() => dispatch({ type: ActionType.RESET })}
        className="btn bg-gray-600 hover:bg-gray-700 text-white"
      >
        <Settings className="h-3 w-3 mr-1" /> Start Over
      </Button>
    </MenuStatusCard>
  ),
};
