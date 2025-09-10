import { format, isSameDay } from 'date-fns';
import React from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@mono-repo/ui';
import { OfferCard } from './offer-card';
import { MenuCard } from './menu-card';
import {
  DayMenuDto,
  DayOffersDto,
  WeekMenuDayDto,
  WeekMenuResponseDto,
  WeekMenuResponseDtoWeekStatus,
  DayHolidayDto,
} from '@mono-repo/api-client';
import { MoreVertical, PlusCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@mono-repo/ui/dropdown-menu';
import { Button } from '@mono-repo/ui/button';
import { Link } from '@tanstack/react-router';

interface WeeklyCalendarProps {
  daysToDisplay: Date[];
  onDayClick?: (date: Date) => void;
  onOfferClick?: (offer: DayOffersDto) => void;
  onMenuClick?: (menu: DayMenuDto) => void;
  onAddHolidayClick?: (date: Date) => void;
  onDeleteHolidayClick?: (holiday: DayHolidayDto) => void;
  locale?: Locale;
  className?: string;
  menuData?: WeekMenuResponseDto;
  weekStatus?: WeekMenuResponseDtoWeekStatus;
}

interface DayHeaderProps {
  day: Date;
  locale?: Locale;
  onAddHolidayClick?: (date: Date) => void;
  onDeleteHolidayClick?: (holiday: DayHolidayDto) => void;
  holiday?: DayHolidayDto;
}

interface DayCellProps {
  day: Date;
  dayData?: WeekMenuDayDto;
  onDayClick?: (date: Date) => void;
  onOfferClick?: (offer: DayOffersDto) => void;
  onMenuClick?: (menu: DayMenuDto) => void;
  onAddHolidayClick?: (date: Date) => void;
  onDeleteHolidayClick?: (holiday: DayHolidayDto) => void;
  weekStatus?: WeekMenuResponseDtoWeekStatus;
}

const DayHeader = React.memo(
  ({
    day,
    locale,
    onAddHolidayClick,
    onDeleteHolidayClick,
    holiday,
  }: DayHeaderProps) => {
    const isToday = isSameDay(day, new Date());

    return (
      <div
        className={cn(
          'p-3 text-center border-b sticky top-0 bg-background z-10 flex items-center justify-between',
          isToday && 'bg-muted font-medium'
        )}
      >
        <div className="flex flex-col items-start">
          <div className="text-sm font-medium">
            {format(day, 'EEEE', { locale })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(day, 'MMM d', { locale })}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            {!holiday && (
              <DropdownMenuItem onClick={() => onAddHolidayClick?.(day)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Holiday</span>
              </DropdownMenuItem>
            )}
            {holiday && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onDeleteHolidayClick?.(holiday)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove Holiday</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);
DayHeader.displayName = 'DayHeader';

const DayCell = React.memo(
  ({
    day,
    dayData,
    onDayClick,
    onOfferClick,
    onMenuClick,
    onAddHolidayClick,
    onDeleteHolidayClick,
    weekStatus,
  }: DayCellProps) => {
    const isToday = isSameDay(day, new Date());
    const holiday = dayData?.holiday;
    const isDisabled = weekStatus !== 'DRAFT' || !!holiday;

    return (
      <div
        className={cn(
          'border-r last:border-r-0 flex flex-col transition-colors relative',
          isToday && 'bg-muted/30',
          !isDisabled && 'cursor-pointer hover:bg-muted/50',
          isDisabled && 'bg-gray-50 dark:bg-gray-900'
        )}
        onClick={() => !isDisabled && onDayClick?.(day)}
      >
        <DayHeader
          day={day}
          holiday={holiday}
          onAddHolidayClick={onAddHolidayClick}
          onDeleteHolidayClick={onDeleteHolidayClick}
        />
        <div className="flex-1 p-3 overflow-y-auto">
          {holiday ? (
            <div className="flex items-center justify-center h-full">
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {holiday.name}
              </span>
            </div>
          ) : (
            <>
              {dayData?.offers.map(offer => (
                <OfferCard
                  key={offer.offerId}
                  offer={offer}
                  onClick={() => !isDisabled && onOfferClick?.(offer)}
                />
              ))}
              {dayData?.menus.map(menu => (
                <MenuCard
                  key={menu.menuId}
                  menu={menu}
                  onClick={() => !isDisabled && onMenuClick?.(menu)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }
);
DayCell.displayName = 'DayCell';

export default function WeeklyCalendar({
  daysToDisplay = [],
  onDayClick,
  onOfferClick,
  onMenuClick,
  onAddHolidayClick,
  onDeleteHolidayClick,
  className,
  menuData,
  weekStatus = 'DRAFT',
}: WeeklyCalendarProps): React.ReactElement {
  if (daysToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-240px)] min-h-[500px] border rounded-lg bg-card">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            No business hours configured
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            To get started with your weekly menu planning, please set up your
            business hours first.
          </p>
          <Button asChild className="mt-4">
            <Link to="/settings/business-hours" className="text-primary">
              Configure Business Hours
            </Link>
            {/* <a href="/settings/business-hours">Configure Business Hours</a> */}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'grid h-[calc(100vh-240px)] min-h-[500px] border rounded-lg overflow-hidden bg-card',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${daysToDisplay.length}, minmax(0, 1fr))`,
      }}
    >
      {daysToDisplay.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayData = menuData?.days[dayKey];

        return (
          <DayCell
            key={day.toISOString()}
            day={day}
            dayData={dayData}
            weekStatus={weekStatus}
            onDayClick={onDayClick}
            onOfferClick={onOfferClick}
            onMenuClick={onMenuClick}
            onAddHolidayClick={onAddHolidayClick}
            onDeleteHolidayClick={onDeleteHolidayClick}
          />
        );
      })}
    </div>
  );
}
