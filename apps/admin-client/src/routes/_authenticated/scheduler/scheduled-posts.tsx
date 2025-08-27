import { createFileRoute } from '@tanstack/react-router';
import { ScheduledTab } from '@/features/scheduler/scheduled-tab';

export const Route = createFileRoute(
  '/_authenticated/scheduler/scheduled-posts'
)({
  component: ScheduledPostsRoute,
});

function ScheduledPostsRoute() {
  return <ScheduledTab />;
}
