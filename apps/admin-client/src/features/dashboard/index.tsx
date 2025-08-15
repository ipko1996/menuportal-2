import { Button } from '@mono-repo/ui/button';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { UserButton } from '@clerk/clerk-react';
import { useGetMenusForWeek } from '@mono-repo/api-client';
import WeeklyCalendar from './components/weekly-calendar';
import { useMemo, useState } from 'react';
import { addWeeks, getISOWeek, getYear, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemDialog } from './components/item-dialog';

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<{
    type: 'offer' | 'menu';
    data: any;
  } | null>(null);

  const currentWeekString = useMemo(() => {
    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }, [currentDate]);

  const { data: menus, isLoading } = useGetMenusForWeek(currentWeekString);

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
    setEditingItem(null); // Clear editing item when creating new
    setShowDialog(true);
  };

  const handleOfferClick = (offer: any) => {
    setEditingItem({ type: 'offer', data: offer });
    setSelectedDate(null); // Clear selected date when editing
    setShowDialog(true);
  };

  const handleMenuClick = (menu: any) => {
    setEditingItem({ type: 'menu', data: menu });
    setSelectedDate(null); // Clear selected date when editing
    setShowDialog(true);
  };

  const handleDialogClose = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      // Reset all state when dialog closes
      setSelectedDate(null);
      setEditingItem(null);
    }
  };

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <UserButton />
        </div>
      </Header>

      {/* ===== Main ===== */}
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

        <WeeklyCalendar
          currentDate={currentDate}
          onDayClick={handleDayClick}
          menuData={menus}
          onOfferClick={handleOfferClick}
          onMenuClick={handleMenuClick}
        />

        <ItemDialog
          open={showDialog}
          onOpenChange={handleDialogClose}
          selectedDate={selectedDate}
          editingItem={editingItem}
          currentWeekString={currentWeekString}
        />
      </Main>
    </>
  );
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
];
