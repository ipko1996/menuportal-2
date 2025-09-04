import { useState, useEffect } from 'react';

import { DishAutocomplete } from '@/components/dish-autocomplete';
import {
  Input,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mono-repo/ui';
import { ConfirmationDialog } from './confirmation-dialog';
import { CreateOfferDto, DayOffersDto } from '@mono-repo/api-client';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { OfferFormData, offerFormSchema } from '../schema/validation-schemas';

interface OfferFormProps {
  selectedDate: Date;
  onSubmit: (data: CreateOfferDto) => void;
  editingItem?: DayOffersDto;
  onDelete?: () => void;
}

export function OfferForm({
  selectedDate,
  onSubmit,
  editingItem,
  onDelete,
}: OfferFormProps) {
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      dishId: 0,
      price: 0,
      availability: '',
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingItem) {
      form.reset({
        dishId: editingItem.dish?.dishId || 0,
        price: editingItem.price || 0,
        availability: format(selectedDate, 'yyyy-MM-dd') || '',
      });
    } else if (selectedDate) {
      form.reset({
        dishId: 0,
        price: 0,
        availability: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
  }, [selectedDate, editingItem, form]);

  const handleSubmit = (data: OfferFormData) => {
    onSubmit({
      ...data,
      price: Number(data.price),
    });
  };

  const resetForm = () => {
    form.reset();
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const isEditing = !!editingItem;
  const submitText = isEditing ? 'Update Offer' : 'Create Offer';

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="dishId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dish</FormLabel>
                <FormControl>
                  <DishAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    autoFocus={!isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (in cents)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    value={field.value || ''}
                    onChange={e =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="Enter price in cents"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
      </Form>

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
