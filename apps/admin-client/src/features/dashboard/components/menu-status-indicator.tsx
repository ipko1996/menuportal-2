import {
  Clock,
  CheckCircle,
  X,
  Send,
  Calendar,
  FileText,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

export const MenuStatusValues = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
] as const;

type MenuStatus = (typeof MenuStatusValues)[number];

interface MenuStatusIndicatorProps {
  status: MenuStatus;
  weekNumber?: number;
  onScheduleClick?: () => void;
  onCancelSchedule?: () => void;
  onRetrySchedule?: () => void;
  onViewPublished?: () => void;
}

const statusConfig = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Draft',
    icon: FileText,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  SCHEDULED: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Scheduled',
    icon: Clock,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  PUBLISHED: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Published',
    icon: Eye,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  FAILED: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Failed',
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function MenuStatusIndicator({
  status,
  weekNumber,
  onScheduleClick,
  onCancelSchedule,
  onRetrySchedule,
  onViewPublished,
}: MenuStatusIndicatorProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const [isScheduling, setIsScheduling] = useState(false);
  const [justScheduled, setJustScheduled] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleScheduleClick = async () => {
    setIsScheduling(true);

    setTimeout(() => {
      setIsScheduling(false);
      setJustScheduled(true);
      onScheduleClick?.();

      setTimeout(() => setJustScheduled(false), 2000);
    }, 1000);
  };

  const handleCancelSchedule = async () => {
    setIsCanceling(true);

    setTimeout(() => {
      setIsCanceling(false);
      onCancelSchedule?.();
    }, 800);
  };

  const handleRetrySchedule = async () => {
    setIsRetrying(true);

    setTimeout(() => {
      setIsRetrying(false);
      onRetrySchedule?.();
    }, 1000);
  };

  const renderButton = () => {
    if (status === 'PUBLISHED') {
      return (
        <button
          onClick={onViewPublished}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all duration-200 bg-green-500 hover:bg-green-600 text-white border-green-600 hover:border-green-700 hover:shadow-md active:scale-95"
        >
          <Eye className="h-3 w-3" />
          View Published
        </button>
      );
    }

    if (status === 'FAILED') {
      return (
        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          >
            <Calendar className="h-3 w-3" />
            Schedule
          </button>
          <button
            onClick={handleRetrySchedule}
            disabled={isRetrying}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all duration-200 ${
              isRetrying
                ? 'bg-orange-100 border-orange-300 text-orange-700 shadow-inner'
                : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600 hover:border-orange-700 hover:shadow-md active:scale-95'
            }`}
          >
            {isRetrying ? (
              <>
                <Clock className="h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                Try Again
              </>
            )}
          </button>
        </div>
      );
    }

    if (status === 'SCHEDULED') {
      return (
        <button
          onClick={handleCancelSchedule}
          disabled={isCanceling}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all duration-200 ${
            isCanceling
              ? 'bg-red-100 border-red-300 text-red-700 shadow-inner'
              : 'bg-red-500 hover:bg-red-600 text-white border-red-600 hover:border-red-700 hover:shadow-md active:scale-95'
          }`}
        >
          {isCanceling ? (
            <>
              <X className="h-3 w-3 animate-spin" />
              Canceling...
            </>
          ) : (
            <>
              <X className="h-3 w-3" />
              Cancel
            </>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={handleScheduleClick}
        disabled={isScheduling || justScheduled}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all duration-200 ${
          justScheduled
            ? 'bg-green-500 border-green-600 text-white shadow-md'
            : isScheduling
            ? 'bg-gray-100 border-gray-300 text-gray-700 shadow-inner'
            : 'bg-black hover:bg-gray-800 text-white border-gray-800 hover:border-gray-700 hover:shadow-md active:scale-95'
        }`}
      >
        {justScheduled ? (
          <>
            <CheckCircle className="h-3 w-3 animate-pulse" />
            Scheduled!
          </>
        ) : isScheduling ? (
          <>
            <Clock className="h-3 w-3 animate-spin" />
            Scheduling...
          </>
        ) : (
          <>
            <Send className="h-3 w-3" />
            Schedule
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${config.bgColor} rounded-lg border-2 ${config.borderColor} shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${config.color}`}>
            <StatusIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Menu Status
              </span>
              {weekNumber && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                  Week {weekNumber}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-medium ${config.color.split(' ')[1]}`}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {renderButton()}
    </div>
  );
}
