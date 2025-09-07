import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import * as Handlebars from 'handlebars';

import { WeekMenuDayDto } from '@/modules/week-menu/dto/week-menu-response.dto';

interface DayWithName {
  dayName: string;
  dayData: WeekMenuDayDto | undefined;
}

// Helper function to format a date using date-fns and Hungarian locale
const formatDate = (date: Date): string => {
  return format(date, 'yyyy. MM. dd.', { locale: hu });
};

// Register helper to format date range using date-fns
Handlebars.registerHelper(
  'formatDateRange',
  (weekStart: string, weekEnd: string): string => {
    const start = parseISO(weekStart);
    const end = parseISO(weekEnd);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
);

// Register helper to format price in Hungarian Forint
Handlebars.registerHelper(
  'formatPrice',
  (price: number): string => `${price}.-`
);

// Updated helper to get only business days (days that exist in the filtered data)
Handlebars.registerHelper(
  'getDaysInOrder',
  (days: Record<string, WeekMenuDayDto>, weekStart: string): DayWithName[] => {
    const dayNames: Record<number, string> = {
      0: 'VASÁRNAP',
      1: 'HÉTFŐ',
      2: 'KEDD',
      3: 'SZERDA',
      4: 'CSÜTÖRTÖK',
      5: 'PÉNTEK',
      6: 'SZOMBAT',
    };

    const startDate = parseISO(weekStart);
    const result: DayWithName[] = [];

    // Generate 7 days starting from weekStart, but only include days that exist in the filtered data
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();

      // Only add days that exist in the filtered days data (business days)
      if (days[dateString]) {
        result.push({
          dayName: dayNames[dayOfWeek],
          dayData: days[dateString],
        });
      }
    }

    return result;
  }
);

// Register helper for logical OR operation
Handlebars.registerHelper('or', (a: boolean, b: boolean): boolean => a || b);

// Register helper to check if a day has content (offers, menus, or holiday)
Handlebars.registerHelper('hasContent', (dayData: WeekMenuDayDto): boolean => {
  if (!dayData) return false;
  return !!(dayData.offers?.length || dayData.menus?.length || dayData.holiday);
});

// Register helper to check if a day is a holiday
Handlebars.registerHelper('isHoliday', (dayData: WeekMenuDayDto): boolean => {
  return !!dayData?.holiday;
});

export default Handlebars;
