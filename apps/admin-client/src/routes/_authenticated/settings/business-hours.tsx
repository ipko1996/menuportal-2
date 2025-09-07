import SettingsBusinessHours from '@/features/settings/business-hours';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/business-hours')(
  {
    component: SettingsBusinessHours,
  }
);
