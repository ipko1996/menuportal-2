import { Main } from '@/components/layout/main';
import WeeklyCalendar from './components/weekly-calendar';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { addWeeks, getISOWeek, getYear, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemDialog } from './components/item-dialog';
import {
  useGetMenusForWeek,
  type DayOffersDto,
  type DayMenuDto,
  UpdateOfferDto,
  UpdateMenuDto,
  WeekMenuResponseDtoWeekStatus,
} from '@mono-repo/api-client';
import { stateComponentMap } from './components/menu-status-indicator';
import { Button } from '@mono-repo/ui';
import { postStateMachine } from './components/status-indicator/state-machine';
import { ActionType, PostState } from './components/status-indicator/types';
import { useWeekActions } from './components/status-indicator/use-actions';

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingItem, setEditingItem] = useState<{
    id: number;
    type: 'offer' | 'menu';
    data: UpdateOfferDto | UpdateMenuDto;
  } | null>(null);

  const currentWeekString = useMemo(() => {
    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }, [currentDate]);

  const { data: menus, isLoading } = useGetMenusForWeek(currentWeekString);

  const [state, dispatch] = useReducer(postStateMachine, {
    isLoading: false,
    status: PostState.Draft,
    weekNumber: '',
  });

  useEffect(() => {
    if (menus?.weekStatus) {
      switch (menus.weekStatus) {
        case WeekMenuResponseDtoWeekStatus.DRAFT:
          dispatch({ type: ActionType.CANCEL });
          break;
        case WeekMenuResponseDtoWeekStatus.SCHEDULED:
          dispatch({ type: ActionType.SCHEDULE });
          break;
      }
    }
  }, [menus?.weekStatus]);

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date);
    setSelectedDate(date);
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleOfferClick = (offer: DayOffersDto) => {
    setEditingItem({ type: 'offer', data: offer, id: offer.offerId });
    const offerDate = menus?.days
      ? Object.keys(menus.days).find(date =>
          menus.days[date].offers.some(o => o.offerId === offer.offerId)
        )
      : null;
    if (offerDate) {
      setSelectedDate(parseISO(offerDate));
    }
    setShowDialog(true);
  };

  const handleMenuClick = (menu: DayMenuDto) => {
    setEditingItem({ type: 'menu', data: menu, id: menu.menuId });
    const dateKey = menus?.days
      ? Object.keys(menus.days).find(date =>
          menus.days[date].menus.some(m => m.menuId === menu.menuId)
        )
      : null;
    if (dateKey) {
      setSelectedDate(parseISO(dateKey));
    }
    setShowDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const CurrentStateComponent = stateComponentMap[state.status];
  const actions = useWeekActions(currentWeekString, dispatch);

  return (
    <Main>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            className="flex items-center gap-1 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="flex items-center gap-1 bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <CurrentStateComponent
          actions={actions}
          state={state}
          dispatch={dispatch}
        />
      </div>

      <WeeklyCalendar
        currentDate={currentDate}
        onDayClick={handleDayClick}
        menuData={menus}
        onOfferClick={handleOfferClick}
        onMenuClick={handleMenuClick}
        weekStatus={menus?.weekStatus || 'DRAFT'}
      />

      <ItemDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        selectedDate={selectedDate}
        editingItem={editingItem}
        currentWeekString={currentWeekString}
      />
    </Main>
  );
}
