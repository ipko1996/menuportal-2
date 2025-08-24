import {
  Post,
  PostPlatform,
  PostStatus,
  type WeekMenuResponseDtoWeekStatus,
} from '@mono-repo/api-client';
import {
  Clock,
  X,
  Send,
  Calendar,
  FileText,
  Eye,
  AlertTriangle,
  Settings,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Twitter,
  Youtube,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Button } from '@mono-repo/ui';
import { ReactNode } from 'react';
import {
  ActionWithPayload,
  NewState,
  PostState,
} from './status-indicator/types';

const mockViewPublished = (weekNumber: number) => {
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
  weekNumber: number;
  children?: ReactNode;
  statusText?: string;
  statusTextColor?: string;
}

export const MenuStatusCard: React.FC<MenuStatusCardProps> = ({
  statusConfig,
  weekNumber,
  children,
  statusText,
  statusTextColor,
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
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border shadow-sm h-14 transition-all duration-300 ${bgColor} ${borderColor}`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full ${iconContainerClasses}`}>
          <StatusIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col h-10 justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold text-gray-900 dark:text-gray-100`}
            >
              {label}
            </span>
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-200">
              Week {weekNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
  [PostState.Loading]: {
    label: 'Loading',
    icon: Clock,
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconContainerClasses:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
  },
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
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-700',
    iconContainerClasses:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-600',
    textColor: 'text-red-800 dark:text-red-100',
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
    label: 'Draft',
    icon: FileText,
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    iconContainerClasses:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
    textColor: 'text-gray-600 dark:text-gray-300',
  },
  [PostState.Partially_Failed]: {
    label: 'Partially Failed',
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-700',
    iconContainerClasses:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-600',
    textColor: 'text-amber-800 dark:text-amber-100',
  },
};

interface StateComponentProps {
  state: NewState;
  dispatch: React.Dispatch<ActionWithPayload>;
  actions: {
    handleSchedule: () => Promise<void>;
    handleCancel: () => Promise<void>;
    isScheduling: boolean;
    isCancelling: boolean;
  };
  weekNumber: number;
  posts: Post[] | undefined;
}

interface PlatformIndicatorsProps {
  posts: Post[];
  className?: string;
}

const platformIcons = {
  [PostPlatform.FACEBOOK]: Facebook,
  [PostPlatform.INSTAGRAM]: Instagram,
  [PostPlatform.TWITTER]: Twitter,
};

const platformColors = {
  [PostPlatform.FACEBOOK]: 'text-blue-600 dark:text-blue-400',
  [PostPlatform.INSTAGRAM]: 'text-pink-600 dark:text-pink-400',
  [PostPlatform.TWITTER]: 'text-sky-600 dark:text-sky-400',
};

export const PlatformIndicators: React.FC<PlatformIndicatorsProps> = ({
  posts,
  className = '',
}) => {
  const platforms = [...new Set(posts.map(post => post.platform))];

  if (platforms.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {platforms.map(platform => {
        const Icon = platformIcons[platform];
        const colorClass = platformColors[platform];
        return (
          <div
            key={platform}
            className={`p-1 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600 ${colorClass}`}
            title={platform}
          >
            <Icon className="h-4 w-4" />
          </div>
        );
      })}
      {platforms.length > 1 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">
          {platforms.length} platforms
        </span>
      )}
    </div>
  );
};

export const stateComponentMap: Record<
  PostState,
  React.FC<StateComponentProps>
> = {
  [PostState.Loading]: ({ state, weekNumber }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Loading}
      weekNumber={weekNumber}
      statusText="Processing..."
    >
      <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
        <Clock className="h-3 w-3 mr-2 animate-spin" />
        Please wait
      </span>
    </MenuStatusCard>
  ),
  [PostState.Draft]: ({ state, dispatch, actions, weekNumber }) => (
    <MenuStatusCard statusConfig={stateUIConfig.Draft} weekNumber={weekNumber}>
      <Button
        onClick={() => actions.handleSchedule()}
        disabled={actions.isScheduling}
        className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {actions.isScheduling ? (
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
  [PostState.Overdue]: ({ state, dispatch, weekNumber, actions }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Overdue}
      weekNumber={weekNumber}
      statusText="Needs scheduling"
    >
      <Button
        onClick={() => actions.handleSchedule()}
        disabled={actions.isScheduling || actions.isCancelling}
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
      >
        {actions.isScheduling ? (
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
  [PostState.Scheduled]: ({ state, weekNumber, actions, posts }) => {
    const scheduledPosts =
      posts?.filter(post => post.status === PostStatus.SCHEDULED) ?? [];
    console.log(state);
    return (
      <MenuStatusCard
        statusConfig={stateUIConfig.Scheduled}
        weekNumber={weekNumber}
        statusText="Posts Mon 9 AM"
        statusTextColor="text-blue-700 dark:text-blue-300"
      >
        <div className="flex items-center gap-2">
          <PlatformIndicators posts={scheduledPosts} />

          <Button
            onClick={() => actions.handleCancel()}
            disabled={actions.isCancelling}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {actions.isCancelling ? (
              <>
                <X className="h-3 w-3 mr-1 animate-spin" /> Canceling...
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" /> Cancel
              </>
            )}
          </Button>
        </div>
      </MenuStatusCard>
    );
  },
  [PostState.Published]: ({ state, weekNumber, posts }) => {
    const publishedPosts =
      posts?.filter(post => post.status === PostStatus.PUBLISHED) ?? [];

    return (
      <MenuStatusCard
        statusConfig={stateUIConfig.Published}
        weekNumber={weekNumber}
      >
        <div className="flex items-center gap-2">
          <PlatformIndicators posts={publishedPosts} />
          <Button
            onClick={() => mockViewPublished(weekNumber)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Eye className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">View</span>
          </Button>
        </div>
      </MenuStatusCard>
    );
  },

  [PostState.Failed_OneTimeRetry]: ({
    state,
    dispatch,
    weekNumber,
    actions,
  }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Failed_OneTimeRetry}
      weekNumber={weekNumber}
    >
      <Button
        // onClick={() => dispatch({ type: ActionType.RETRY })}
        disabled={actions.isScheduling || actions.isCancelling}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        {actions.isScheduling ? (
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
  [PostState.CannotSchedule_Closed]: ({ state, weekNumber }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.CannotSchedule_Closed}
      weekNumber={weekNumber}
      statusText="Scheduling closed"
    >
      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium px-4">
        Cannot schedule
      </span>
    </MenuStatusCard>
  ),
  [PostState.Failed_SeeDetails]: ({ state, dispatch, weekNumber }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Failed_SeeDetails}
      weekNumber={weekNumber}
    >
      <Button
        // onClick={() => dispatch({ type: ActionType.RESET })}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Settings className="h-3 w-3 mr-1" /> See Details
      </Button>
    </MenuStatusCard>
  ),
  [PostState.Missed_Deadline]: ({ state, dispatch, weekNumber }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.Missed_Deadline}
      weekNumber={weekNumber}
      statusText="Final deadline passed"
    ></MenuStatusCard>
  ),
  [PostState.CannotSchedule_Nothing]: ({ state, dispatch, weekNumber }) => (
    <MenuStatusCard
      statusConfig={stateUIConfig.CannotSchedule_Nothing}
      weekNumber={weekNumber}
      statusText="Nothing to schedule"
    ></MenuStatusCard>
  ),
  [PostState.Partially_Failed]: ({ state, weekNumber, posts }) => {
    const failedPosts =
      posts?.filter(
        post =>
          post.status === PostStatus.FAILED ||
          post.status === PostStatus.SCHEDULED
      ) ?? [];
    const successfulPosts =
      posts?.filter(post => post.status === PostStatus.PUBLISHED) ?? [];

    return (
      <MenuStatusCard
        statusConfig={stateUIConfig.Partially_Failed}
        weekNumber={weekNumber}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <PlatformIndicators posts={successfulPosts} />
              <span className="text-xs text-green-600 dark:text-green-400 hidden sm:inline">
                {successfulPosts.length} success
              </span>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              {failedPosts.length} failed
            </span>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Retry</span>
          </Button>
        </div>
      </MenuStatusCard>
    );
  },
};
