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
import { OfferForm } from './offer-form';
import { MenuForm } from './menu-form';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
  editingItem?: { type: 'offer' | 'menu'; data: any } | null;
}

interface CreateOfferDto {
  dishId: number;
  price: number;
  availability: string;
}

interface CreateMenuDto {
  dishes: number[];
  availability: string;
  menuName: string;
  price: number;
}

export function ItemDialog({
  open,
  onOpenChange,
  selectedDate,
  editingItem,
}: ItemDialogProps) {
  const [activeTab, setActiveTab] = useState('offer');

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !editingItem) {
      setActiveTab('offer');
    }
    onOpenChange(newOpen);
  };

  const handleOfferSubmit = (data: CreateOfferDto) => {
    if (editingItem) {
      console.log('Updating offer:', data);
    } else {
      console.log('Creating offer:', data);
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
                editingItem={editingItem.data}
                onDelete={handleDelete}
              />
            ) : (
              <MenuForm
                selectedDate={selectedDate}
                onSubmit={handleMenuSubmit}
                editingItem={editingItem.data}
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
