import DishManager from '@/features/dish-manager';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dish-manager/')({
  component: DishManager,
});
