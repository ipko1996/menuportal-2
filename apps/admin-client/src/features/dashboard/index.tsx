import { Main } from '@/components/layout/main';
import WeeklyCalendar from './components/weekly-calendar';
import { useEffect, useMemo, useReducer, useState } from 'react';
import {
  addWeeks,
  getISOWeek,
  getYear,
  subWeeks,
  parseISO,
  isSameWeek,
} from 'date-fns';
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
import { Button, cn } from '@mono-repo/ui';
import { postStateMachine } from './components/status-indicator/state-machine';
import { ActionType, PostState } from './components/status-indicator/types';
import { useWeekActions } from './components/status-indicator/use-actions';

export default function Dashboard() {
  // Initialize with next week instead of current week
  const [currentDate, setCurrentDate] = useState(() => addWeeks(new Date(), 1));
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

  const {
    data: menus,
    isLoading,
    isFetching,
  } = useGetMenusForWeek(currentWeekString);

  const [state, dispatch] = useReducer(postStateMachine, {
    status: PostState.Loading,
  });

  useEffect(() => {
    // ⬇️ Prioritize the fetching state ⬇️
    // If a refetch is happening, force the UI into a loading state.
    if (isFetching) {
      dispatch({ type: ActionType.SET_LOADING });
      return;
    }

    // If there's no data yet (initial load), also show loading.
    if (!menus) {
      dispatch({ type: ActionType.SET_LOADING });
      return;
    }

    // Only when not fetching and data is present, calculate the final state.
    dispatch({
      type: ActionType.SET_STATE,
      payload: menus,
    });
  }, [menus, isFetching]); // ⬅️ Add isFetching to the dependency array

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };

  const goToPlanningWeek = () => {
    setCurrentDate(addWeeks(new Date(), 1));
  };

  const goToThisWeek = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
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

  const weekNumber = useMemo(() => getISOWeek(currentDate), [currentDate]);

  const CurrentStateComponent = stateComponentMap[state.status];
  const actions = useWeekActions(currentWeekString);

  const isPlanningWeek = isSameWeek(currentDate, addWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const isThisWeek = isSameWeek(currentDate, new Date(), { weekStartsOn: 1 });

  return (
    <Main>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
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
          <Button
            size="sm"
            variant={isThisWeek ? 'default' : 'ghost'}
            onClick={goToThisWeek}
            className={
              isThisWeek
                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-700 dark:text-green-200 dark:hover:bg-green-800'
                : ''
            }
          >
            This Week
          </Button>

          <Button
            size="sm"
            variant={isPlanningWeek ? 'default' : 'ghost'}
            onClick={goToPlanningWeek}
            className={
              isPlanningWeek
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-700 dark:text-blue-200 dark:hover:bg-blue-800'
                : ''
            }
          >
            Planning
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
          weekNumber={weekNumber}
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
        weekStatus={menus?.weekStatus}
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
