import { DayMenuDto } from '@mono-repo/api-client';
import { Utensils } from 'lucide-react';

interface MenuCardProps {
  menu: DayMenuDto;
  onClick?: (menu: DayMenuDto) => void;
}

export function MenuCard({ menu, onClick }: MenuCardProps) {
  if (!menu || !menu.menuName) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(menu);
  };

  return (
    <div
      className="mb-2 p-2 bg-background rounded-md border shadow-sm hover:border-primary cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        <Utensils className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
        <div className="min-w-0 flex-grow">
          <div
            className="text-sm font-medium leading-tight break-words hyphens-auto line-clamp-2 md:line-clamp-1"
            title={menu.menuName}
          >
            {menu.menuName}
          </div>
        </div>
      </div>

      {menu.dishes && menu.dishes.length > 0 && (
        <div className="text-xs mt-2 space-y-1">
          {menu.dishes.map(dish => (
            <div
              key={dish.dishId}
              className="flex justify-between items-start gap-2"
            >
              <span
                className="break-words hyphens-auto leading-tight line-clamp-2 md:line-clamp-1 flex-grow min-w-0"
                title={dish.dishName!}
              >
                {dish.dishName}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs mt-2 font-medium text-muted-foreground text-right">
        {menu.price} Ft
      </div>
    </div>
  );
}
