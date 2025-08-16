import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@mono-repo/ui';
import { useState } from 'react';
import {
  useDeleteOffer,
  useDeleteMenu,
  useCreateOffer,
  useCreateMenu,
  useUpdateOffer,
  CreateOfferDto,
  UpdateOfferDto,
  CreateMenuDto,
  getGetMenusForWeekQueryKey,
  UpdateMenuDto,
  DayOffersDto,
  DayMenuDto,
} from '@mono-repo/api-client';
import { OfferForm } from './offer-form';
import { MenuForm } from './menu-form';
import { useQueryClient } from '@tanstack/react-query';
import { useInvalidateMenusOnSuccess } from '../hooks/use-invalidate-menus';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  editingItem?: {
    id: number;
    type: 'offer' | 'menu';
    data: UpdateOfferDto | UpdateMenuDto;
  } | null;
  currentWeekString: string;
}

export function ItemDialog({
  open,
  onOpenChange,
  selectedDate,
  editingItem,
  currentWeekString,
}: ItemDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('offer');

  const { mutate: createOffer } = useCreateOffer({
    mutation: useInvalidateMenusOnSuccess(
      'Offer created successfully',
      currentWeekString
    ),
  });
  const { mutate: createMenu } = useCreateMenu({
    mutation: useInvalidateMenusOnSuccess(
      'Menu created successfully',
      currentWeekString
    ),
  });
  const { mutate: updateOffer } = useUpdateOffer({
    mutation: useInvalidateMenusOnSuccess(
      'Offer updated successfully',
      currentWeekString
    ),
  });
  const { mutate: deleteOffer } = useDeleteOffer({
    mutation: useInvalidateMenusOnSuccess(
      'Offer deleted successfully',
      currentWeekString
    ),
  });
  const { mutate: deleteMenu } = useDeleteMenu({
    mutation: useInvalidateMenusOnSuccess(
      'Menu created successfully',
      currentWeekString
    ),
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !editingItem) {
      setActiveTab('offer');
    }
    onOpenChange(newOpen);
  };

  const handleOfferSubmit = (data: CreateOfferDto | UpdateOfferDto) => {
    if (editingItem) {
      console.log('Updating offer:', data);
      updateOffer({
        id: editingItem.id,
        data: {
          availability: data.availability,
          dishId: data.dishId,
          price: data.price,
        } as UpdateOfferDto,
      });
    } else {
      console.log('Creating offer:', data);
      createOffer({
        data: {
          availability: data.availability,
          dishId: data.dishId,
          price: data.price,
        } as CreateOfferDto,
      });
    }
    handleOpenChange(false);
  };

  const handleMenuSubmit = (data: CreateMenuDto) => {
    if (editingItem) {
      console.log('Updating menu:', data);
    } else {
      console.log('Creating menu:', data);
    }
    handleOpenChange(false);
  };

  const handleDelete = () => {
    if (editingItem) {
      console.log('Deleting item:', editingItem);
      if (editingItem.type === 'offer') {
        deleteOffer({ id: editingItem.id });
      } else {
        deleteMenu({ id: editingItem.id });
      }
      handleOpenChange(false);
    }
  };

  const isEditing = !!editingItem;
  const title = isEditing
    ? `Edit ${editingItem.type === 'offer' ? 'Offer' : 'Menu'}`
    : 'Create New Item';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            {editingItem.type === 'offer' ? (
              <OfferForm
                selectedDate={selectedDate}
                onSubmit={handleOfferSubmit}
                editingItem={editingItem.data as DayOffersDto}
                onDelete={handleDelete}
              />
            ) : (
              <MenuForm
                selectedDate={selectedDate}
                onSubmit={handleMenuSubmit}
                editingItem={editingItem.data as DayMenuDto}
                onDelete={handleDelete}
              />
            )}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offer">Offer</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="offer" className="space-y-4">
              <OfferForm
                selectedDate={selectedDate}
                onSubmit={handleOfferSubmit}
              />
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <MenuForm
                selectedDate={selectedDate}
                onSubmit={handleMenuSubmit}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
