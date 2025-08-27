import { createFileRoute } from '@tanstack/react-router';
import { PendingTab } from '@/features/scheduler/pending-tab';

export const Route = createFileRoute('/_authenticated/scheduler/pending-posts')(
  {
    component: PendingPostsRoute,
  }
);

function PendingPostsRoute() {
  return <PendingTab />;
}
