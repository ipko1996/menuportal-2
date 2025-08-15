import type React from 'react';
import { useState, useEffect } from 'react';

import { Plus, X, ChevronDown } from 'lucide-react';
import { DishAutocomplete } from '@/components/dish-autocomplete';
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  DropdownMenuItem,
  DropdownMenu,
  Label,
  Button,
} from '@mono-repo/ui';
import { ConfirmationDialog } from './confirmation-dialog';
import { format } from 'date-fns';
import { DayMenuDto, Dish } from '@mono-repo/api-client';

interface CreateMenuDto {
  dishes: number[];
  availability: string;
  menuName: string;
  price: number;
}

interface MenuFormProps {
  selectedDate: Date;
  onSubmit: (data: CreateMenuDto) => void;
  editingItem?: DayMenuDto;
  onDelete?: () => void;
}

const dishTypes = [
  { id: 'appetizer', name: 'Appetizer', icon: '🥗' },
  { id: 'soup', name: 'Soup', icon: '🍲' },
  { id: 'main', name: 'Main Course', icon: '🍽️' },
  { id: 'dessert', name: 'Dessert', icon: '🍰' },
  { id: 'beverage', name: 'Beverage', icon: '🥤' },
  { id: 'side', name: 'Side Dish', icon: '🥖' },
];

export function MenuForm({
  selectedDate,
  onSubmit,
  editingItem,
  onDelete,
}: MenuFormProps) {
  const [form, setForm] = useState<CreateMenuDto>({
    dishes: [0, 0],
    availability: '',
    menuName: '',
    price: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        dishes: editingItem.dishes
          ?.map((d: Dish) => d.dishId)
          .filter((id): id is number => id !== null && id !== undefined) || [
          0, 0,
        ],
        availability: format(selectedDate, 'yyyy-MM-dd') || '',
        menuName: editingItem.menuName || '',
        price: editingItem.price || 0,
      });
    } else if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setForm(prev => ({ ...prev, availability: dateString }));
    } else {
      setForm({
        dishes: [0, 0],
        availability: '',
        menuName: '',
        price: 0,
      });
    }
  }, [selectedDate, editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const resetForm = () => {
    if (editingItem) {
      setForm({
        dishes: editingItem.dishes
          ?.map((d: Dish) => d.dishId)
          .filter((id): id is number => id !== null && id !== undefined) || [
          0, 0,
        ],
        availability: format(selectedDate, 'yyyy-MM-dd') || '',
        menuName: editingItem.menuName || '',
        price: editingItem.price || 0,
      });
    } else {
      const currentAvailability = form.availability;
      setForm({
        dishes: [0, 0],
        availability: currentAvailability,
        menuName: '',
        price: 0,
      });
    }
  };

  const addDish = (dishType?: string) => {
    setForm(prev => ({
      ...prev,
      dishes: [...prev.dishes, 0],
    }));
  };

  const removeDish = (index: number) => {
    if (form.dishes.length > 2) {
      setForm(prev => ({
        ...prev,
        dishes: prev.dishes.filter((_, i) => i !== index),
      }));
    }
  };

  const updateDish = (index: number, dishId: number) => {
    setForm(prev => ({
      ...prev,
      dishes: prev.dishes.map((dish, i) => (i === index ? dishId : dish)),
    }));
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const isEditing = !!editingItem;
  const submitText = isEditing ? 'Update Menu' : 'Create Menu';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="menu-name">Menu Name</Label>
          <Input
            id="menu-name"
            value={form.menuName}
            onChange={e =>
              setForm(prev => ({ ...prev, menuName: e.target.value }))
            }
            placeholder="Enter menu name"
            maxLength={255}
            autoFocus={false}
            tabIndex={isEditing ? -1 : undefined}
          />
        </div>

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
                >
                  <Plus className="h-4 w-4" />
                  Add Dish
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {dishTypes.map(type => (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => addDish(type.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span>{type.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            {form.dishes.map((dishId, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <DishAutocomplete
                    value={dishId}
                    onChange={newDishId => updateDish(index, newDishId)}
                  />
                </div>
                {form.dishes.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDish(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="menu-price">Price (in cents)</Label>
          <Input
            id="menu-price"
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="menu-availability">Availability Date</Label>
          <Input
            id="menu-availability"
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
        description={`Are you sure you want to delete this menu "${form.menuName}"? This action cannot be undone.`}
      />
    </>
  );
}
