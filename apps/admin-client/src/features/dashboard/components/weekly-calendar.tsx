import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import React from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@mono-repo/ui';
import { OfferCard } from './offer-card';
import { MenuCard } from './menu-card';
import { WeekMenuDayDto, WeekMenuResponseDto } from '@mono-repo/api-client';

interface WeeklyCalendarProps {
  currentDate: Date;
  onDayClick?: (date: Date) => void;
  onOfferClick?: (offer: any) => void;
  onMenuClick?: (menu: any) => void;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children?: (date: Date) => React.ReactNode;
  menuData?: WeekMenuResponseDto;
}

interface DayHeaderProps {
  day: Date;
  locale?: Locale;
}

interface DayCellProps {
  day: Date;
  onDayClick?: (date: Date) => void;
  onOfferClick?: (offer: any) => void;
  onMenuClick?: (menu: any) => void;
  children?: React.ReactNode;
  dayData?: WeekMenuDayDto;
}

const DayHeader = React.memo(({ day, locale }: DayHeaderProps) => {
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={cn(
        'p-3 text-center border-b sticky top-0 bg-background z-10',
        isToday && 'bg-muted font-medium'
      )}
    >
      <div className="text-sm font-medium">
        {format(day, 'EEEE', { locale })}
      </div>
      <div className="text-xs text-muted-foreground">
        {format(day, 'MMM d', { locale })}
      </div>
    </div>
  );
});
DayHeader.displayName = 'DayHeader';

const DayCell = React.memo(
  ({
    day,
    onDayClick,
    onOfferClick,
    onMenuClick,
    children,
    dayData,
  }: DayCellProps) => {
    const isToday = isSameDay(day, new Date());

    const handleDayClick = (e: React.MouseEvent) => {
      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).closest('.day-content')
      ) {
        onDayClick?.(day);
      }
    };

    return (
      <div
        className={cn(
          'border-r last:border-r-0 flex flex-col cursor-pointer hover:bg-muted/50 transition-colors',
          isToday && 'bg-muted/30'
        )}
        onClick={handleDayClick}
      >
        <DayHeader day={day} />
        <div className="flex-1 p-3 overflow-y-auto day-content">
          {dayData?.offers.map(offer => (
            <OfferCard
              key={offer.offerId}
              offer={offer}
              onClick={onOfferClick}
            />
          ))}
          {dayData?.menus.map(menu => (
            <MenuCard key={menu.menuId} menu={menu} onClick={onMenuClick} />
          ))}
          {children}
        </div>
      </div>
    );
  }
);
DayCell.displayName = 'DayCell';

// Main component
export default function WeeklyCalendar({
  currentDate = new Date(),
  onDayClick,
  onOfferClick,
  onMenuClick,
  locale,
  weekStartsOn = 1,
  className,
  children,
  menuData,
}: WeeklyCalendarProps): React.ReactElement {
  const validCurrentDate =
    currentDate instanceof Date && !isNaN(currentDate.getTime())
      ? currentDate
      : new Date();

  const startDate = startOfWeek(validCurrentDate, { weekStartsOn, locale });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div
      className={cn(
        'grid grid-cols-7 h-[calc(100vh-240px)] min-h-[500px] border rounded-lg overflow-hidden bg-card',
        className
      )}
    >
      {weekDays.map((day, index) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayData = menuData?.days[dayKey];

        return (
          <DayCell
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            day={day}
            onDayClick={onDayClick}
            onOfferClick={onOfferClick}
            onMenuClick={onMenuClick}
            dayData={dayData}
          >
            {children?.(day)}
          </DayCell>
        );
      })}
    </div>
  );
}

export type { WeeklyCalendarProps };
