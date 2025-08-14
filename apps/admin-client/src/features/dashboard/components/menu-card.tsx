import { DayMenuDto } from '@mono-repo/api-client';
import { Utensils } from 'lucide-react';

interface MenuCardProps {
  menu: DayMenuDto;
}

export function MenuCard({ menu }: MenuCardProps) {
  return (
    <div className="mb-2 p-2 bg-background rounded-md border shadow-sm hover:border-primary cursor-pointer">
      <div className="flex items-center gap-2">
        <Utensils className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="text-sm font-medium flex-grow">{menu.menuName}</div>
      </div>

      <div className="text-xs mt-2 space-y-1">
        {menu.dishes.map(dish => (
          <div key={dish.dishId} className="flex justify-between">
            <span>{dish.dishName}</span>
          </div>
        ))}
      </div>

      <div className="text-xs mt-2 font-medium text-muted-foreground text-right">
        {menu.price} Ft
      </div>
    </div>
  );
}
