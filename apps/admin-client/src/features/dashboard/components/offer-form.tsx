import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { DishAutocomplete, getDishIcon } from '@/components/dish-autocomplete';
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  DropdownMenuItem,
  DropdownMenu,
  Label,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mono-repo/ui';
import { ConfirmationDialog } from './confirmation-dialog';
import {
  CreateOfferDto,
  DayOffersDto,
  useGetRestaurantDishTypes,
} from '@mono-repo/api-client';
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
  const { data: availableDishTypes = [] } = useGetRestaurantDishTypes();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // State to manage the visibility and type of the dish selector
  const [selectedDishTypeId, setSelectedDishTypeId] = useState<number | null>(
    null
  );

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      dishId: 0,
      price: 0,
      availability: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    // If editing an existing offer, show the dish selector with the correct type
    if (editingItem && editingItem.dish) {
      setSelectedDishTypeId(editingItem.dish.dishTypeId);
      form.reset({
        dishId: editingItem.dish.dishId || 0,
        price: editingItem.price || 0,
        availability: format(selectedDate, 'yyyy-MM-dd') || '',
      });
    } else {
      // If creating a new offer, start with no dish selector visible
      setSelectedDishTypeId(null);
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

  const handleSelectDishType = (dishTypeId: number) => {
    setSelectedDishTypeId(dishTypeId);
    const selectedType = availableDishTypes.find(
      type => type.dishTypeId === dishTypeId
    );
    if (selectedType) {
      form.setValue('price', selectedType.price, { shouldValidate: true });
    }
  };

  const removeDish = () => {
    setSelectedDishTypeId(null);
    form.setValue('dishId', 0, { shouldValidate: true });
    form.setValue('price', 0, { shouldValidate: true });
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Dish</Label>
              {selectedDishTypeId !== null && (
                // Show a remove button only when a dish is selected
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={removeDish}
                  aria-label="Remove dish"
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {selectedDishTypeId !== null ? (
              // If a dish type is selected, show the autocomplete input
              <FormField
                control={form.control}
                name="dishId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DishAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        dishTypeId={selectedDishTypeId}
                        autoFocus={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              // Otherwise, show the button to add a dish
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={availableDishTypes.length === 0}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add a dish
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {availableDishTypes.map(type => (
                    <DropdownMenuItem
                      key={type.dishTypeId}
                      onClick={() => handleSelectDishType(type.dishTypeId)}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      {getDishIcon(type.dishTypeId, availableDishTypes)}
                      <span>{type.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

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
                      field.onChange(parseInt(e.target.value, 10) || 0)
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
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
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
