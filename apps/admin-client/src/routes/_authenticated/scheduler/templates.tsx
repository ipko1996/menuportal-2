import { createFileRoute } from '@tanstack/react-router';
import { TemplatesTab } from '@/features/scheduler/templates-tab';

export const Route = createFileRoute('/_authenticated/scheduler/templates')({
  component: TemplatesRoute,
});

function TemplatesRoute() {
  return <TemplatesTab />;
}
