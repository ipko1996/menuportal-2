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
  Badge,
} from '@mono-repo/ui';
import { ConfirmationDialog } from './confirmation-dialog';
import { format } from 'date-fns';
import {
  DayMenuDto,
  Dish,
  useGetAvailableDishtypes,
  CreateMenuDto,
} from '@mono-repo/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MenuFormData, menuFormSchema } from '../schema/validation-schemas';

interface FormDish {
  key: number;
  dishId: number;
  dishTypeId: number;
}

interface MenuFormProps {
  selectedDate: Date;
  onSubmit: (data: CreateMenuDto) => void;
  editingItem?: DayMenuDto;
  onDelete?: () => void;
}

const createDefaultDish = (dishTypeId: number): FormDish => ({
  key: Date.now() + Math.random(),
  dishId: 0,
  dishTypeId,
});

const nameSuggestions = ['Menü', 'Menü A', 'Menü B', 'Menü 1', 'Menü 2'];

export function MenuForm({
  selectedDate,
  onSubmit,
  editingItem,
  onDelete,
}: MenuFormProps) {
  const { data: availableDishTypes = [] } = useGetAvailableDishtypes();
  const [dishes, setDishes] = useState<FormDish[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      menuName: 'Menü',
      dishes: [],
      price: 0,
      availability: '',
    },
  });

  const {
    formState: { isSubmitted },
  } = form;

  useEffect(() => {
    if (editingItem) {
      const mainDishType = availableDishTypes.find(
        dt => dt.dishTypeValue === 'MAIN_DISH'
      );
      const defaultDishTypeId = mainDishType?.id || 0;
      const editingDishes =
        editingItem.dishes?.map((d: Dish) => ({
          key: d.dishId || Math.random(),
          dishId: d.dishId || 0,
          dishTypeId: d.dishTypeId || defaultDishTypeId,
        })) || [];
      setDishes(editingDishes);
      form.reset({
        menuName: editingItem.menuName || 'Menü',
        price: editingItem.price || 0,
        availability: format(selectedDate, 'yyyy-MM-dd'),
        dishes: editingDishes.map(d => d.dishId).filter(id => id > 0),
      });
    } else if (availableDishTypes.length > 0) {
      const soupType = availableDishTypes.find(
        dt => dt.dishTypeValue === 'SOUP' || dt.dishTypeValue === 'MEAT_SOUP'
      );
      const mainDishType = availableDishTypes.find(
        dt => dt.dishTypeValue === 'MAIN_DISH'
      );
      const soupTypeId = soupType?.id || mainDishType?.id || 0;
      const mainDishTypeId = mainDishType?.id || 0;
      if (soupTypeId && mainDishTypeId) {
        const defaultDishes = [
          createDefaultDish(soupTypeId),
          createDefaultDish(mainDishTypeId),
        ];
        setDishes(defaultDishes);
        form.reset({
          menuName: 'Menü',
          price: 0,
          availability: format(selectedDate, 'yyyy-MM-dd'),
          dishes: [],
        });
      }
    }
  }, [selectedDate, editingItem, availableDishTypes, form]);

  useEffect(() => {
    const dishIds = dishes.map(d => d.dishId).filter(id => id > 0);
    form.setValue('dishes', dishIds, { shouldValidate: isSubmitted });
  }, [dishes, form, isSubmitted]);

  const handleSubmit = (data: MenuFormData) => {
    onSubmit({
      ...data,
      price: Number(data.price),
    });
  };

  const addDish = (dishTypeId: number) => {
    setDishes(prev => [...prev, createDefaultDish(dishTypeId)]);
  };

  const removeDish = (key: number) => {
    if (dishes.length > 2) {
      setDishes(prev => prev.filter(dish => dish.key !== key));
    }
  };

  const updateDish = (key: number, dishId: number) => {
    setDishes(prev =>
      prev.map(dish => (dish.key === key ? { ...dish, dishId } : dish))
    );
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const isEditing = !!editingItem;
  const submitText = isEditing ? 'Update Menu' : 'Create Menu';

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="menuName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Menu Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter menu name"
                    maxLength={255}
                  />
                </FormControl>

                {!isEditing && (
                  <div className="pt">
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {nameSuggestions.map(name => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="cursor-pointer font-normal"
                          onClick={() =>
                            form.setValue('menuName', name, {
                              shouldValidate: true,
                            })
                          }
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Dishes</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-transparent"
                    disabled={availableDishTypes.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Add Dish
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {availableDishTypes.map(type => (
                    <DropdownMenuItem
                      key={type.id}
                      onClick={() => addDish(type.id)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {getDishIcon(type.id, availableDishTypes)}
                      <span>{type.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              {dishes.map((dish, index) => (
                <div key={dish.key} className="flex items-center gap-2">
                  <div className="flex-1">
                    <DishAutocomplete
                      value={dish.dishId}
                      onChange={newDishId => updateDish(dish.key, newDishId)}
                      defaultDishTypeId={dish.dishTypeId}
                      autoFocus={index === 0 && !isEditing}
                    />
                  </div>
                  {dishes.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDish(dish.key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {form.formState.errors.dishes && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.dishes.message}
              </p>
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
        description={`Are you sure you want to delete this menu "${form.getValues(
          'menuName'
        )}"? This action cannot be undone.`}
      />
    </>
  );
}
