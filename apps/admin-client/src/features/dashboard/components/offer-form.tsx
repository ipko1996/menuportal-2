import type React from 'react';
import { useState, useEffect } from 'react';

import { DishAutocomplete } from '@/components/dish-autocomplete';
import { Input, Button, Label } from '@mono-repo/ui';
import { ConfirmationDialog } from './confirmation-dialog';

interface CreateOfferDto {
  dishId: number;
  price: number;
  availability: string;
}

interface OfferFormProps {
  selectedDate?: Date | null;
  onSubmit: (data: CreateOfferDto) => void;
  editingItem?: any;
  onDelete?: () => void;
}

export function OfferForm({
  selectedDate,
  onSubmit,
  editingItem,
  onDelete,
}: OfferFormProps) {
  const [form, setForm] = useState<CreateOfferDto>({
    dishId: 0,
    price: 0,
    availability: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        dishId: editingItem.dish?.dishId || 0,
        price: editingItem.price || 0,
        availability: editingItem.availability || '',
      });
    } else if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setForm(prev => ({ ...prev, availability: dateString }));
    } else {
      setForm({
        dishId: 0,
        price: 0,
        availability: '',
      });
    }
  }, [selectedDate, editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const resetForm = () => {
    if (editingItem) {
      // Reset to original values when editing
      setForm({
        dishId: editingItem.dish?.dishId || 0,
        price: editingItem.price || 0,
        availability: editingItem.availability || '',
      });
    } else {
      // Reset to empty when creating
      const currentAvailability = form.availability;
      setForm({
        dishId: 0,
        price: 0,
        availability: currentAvailability,
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const isEditing = !!editingItem;
  const submitText = isEditing ? 'Update Offer' : 'Create Offer';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="offer-dish">Dish</Label>
          <DishAutocomplete
            value={form.dishId}
            onChange={dishId => setForm(prev => ({ ...prev, dishId }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-price">Price (in cents)</Label>
          <Input
            id="offer-price"
            type="number"
            min="0"
            value={form.price || ''}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                price: Number.parseInt(e.target.value) || 0,
              }))
            }
            placeholder="Enter price in cents"
            autoFocus={false}
            tabIndex={isEditing ? -1 : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="offer-availability">Availability Date</Label>
          <Input
            id="offer-availability"
            type="date"
            value={form.availability}
            onChange={e =>
              setForm(prev => ({ ...prev, availability: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-between pt-4">
          {isEditing ? (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
          )}
          <Button type="submit">{submitText}</Button>
        </div>
      </form>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Are you sure?"
        description="Are you sure you want to delete this offer? This action cannot be undone."
      />
    </>
  );
}
