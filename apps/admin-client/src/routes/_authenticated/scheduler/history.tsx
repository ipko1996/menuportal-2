import { createFileRoute } from '@tanstack/react-router';
import { HistoryTab } from '@/features/scheduler/history-tab';

export const Route = createFileRoute('/_authenticated/scheduler/history')({
  component: HistoryRoute,
});

function HistoryRoute() {
  return <HistoryTab />;
}
