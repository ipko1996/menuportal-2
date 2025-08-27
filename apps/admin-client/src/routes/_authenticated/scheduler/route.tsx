import { createFileRoute } from '@tanstack/react-router';
import Scheduler from '@/features/scheduler';

export const Route = createFileRoute('/_authenticated/scheduler')({
  component: Scheduler,
});
