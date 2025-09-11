import SettingsPrices from '@/features/settings/prices';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/settings/prices')({
  component: SettingsPrices,
});
