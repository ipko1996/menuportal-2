import { Outlet, Link } from '@tanstack/react-router';
import { Main } from '@/components/layout/main';
import {
  Settings,
  Calendar,
  Clock,
  History,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Badge, cn } from '@mono-repo/ui';

// This is the main layout component for the Scheduler feature
export default function Scheduler() {
  const tabsTriggerStyle =
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const navItems = [
    {
      href: '/scheduler',
      title: 'Settings',
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    {
      href: '/scheduler/scheduled-posts',
      title: 'Scheduled Posts',
      icon: <Calendar className="h-4 w-4 mr-2" />,
      disabled: true,
    },
    {
      href: '/scheduler/pending-posts',
      title: 'Pending Posts',
      icon: <Clock className="h-4 w-4 mr-2" />,
      disabled: true,
    },
    {
      href: '/scheduler/history',
      title: 'History',
      icon: <History className="h-4 w-4 mr-2" />,
      disabled: true,
    },
    {
      href: '/scheduler/templates',
      title: 'Templates',
      icon: <Plus className="h-4 w-4 mr-2" />,
      disabled: true,
    },
  ];

  return (
    <Main>
      <div className="space-y-6">
        {/* ===== Top Heading ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Media Scheduling</h1>
            <p className="text-muted-foreground">
              Automate your weekly menu posts across social platforms
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Facebook Connected
            </Badge>
            <Badge variant="outline" className="text-pink-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Instagram Connected
            </Badge>
          </div>
        </div>

        <div className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-5">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                tabsTriggerStyle,
                item.disabled && 'cursor-not-allowed opacity-50'
              )}
              activeProps={{
                className: 'bg-background text-foreground shadow-sm',
              }}
              activeOptions={{ exact: true }}
              disabled={item.disabled}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </div>

        <div className="pt-4">
          <Outlet />
        </div>
      </div>
    </Main>
  );
}
