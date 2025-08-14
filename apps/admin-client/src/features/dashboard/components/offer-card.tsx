import { DayOffersDto } from '@mono-repo/api-client';
import { Tag } from 'lucide-react';

interface OfferCardProps {
  offer: DayOffersDto;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <div className="mb-2 p-2 bg-background rounded-md border border-dashed shadow-sm hover:border-primary cursor-pointer">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex-grow">
          <div className="text-sm font-medium">{offer.dish.dishName}</div>
        </div>
      </div>

      <div className="text-xs mt-2 font-medium text-muted-foreground text-right">
        {offer.price} Ft
      </div>
    </div>
  );
}
