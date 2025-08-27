import { createFileRoute } from '@tanstack/react-router';
import { SettingsTab } from '@/features/scheduler/settings-tab';

export const Route = createFileRoute('/_authenticated/scheduler/')({
  component: SettingsRoute,
});

function SettingsRoute() {
  return <SettingsTab />;
}
