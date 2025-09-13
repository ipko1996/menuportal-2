import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mono-repo/ui';
import {
  DishTypeWithDataResponseDto,
  useUpdateDishById,
  type DishResponseDto,
  type DishTypeResponseDto,
} from '@mono-repo/api-client';
import { getDishIcon } from '@/components/dish-autocomplete';
import { useInvalidateDishes } from '../hooks/use-invalidate-dishes';

interface EditDishDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dish: DishResponseDto;
  dishTypes: DishTypeWithDataResponseDto[];
}

export function EditDishDialog({
  isOpen,
  onOpenChange,
  dish,
  dishTypes,
}: EditDishDialogProps) {
  const [editingDish, setEditingDish] = useState<DishResponseDto>(dish);

  const { mutate: updateDish, isPending: isUpdating } = useUpdateDishById({
    mutation: useInvalidateDishes('Dish updated successfully'),
  });

  useEffect(() => {
    setEditingDish(dish);
  }, [dish]);

  const handleUpdate = () => {
    if (editingDish.dishName.trim()) {
      updateDish({
        id: editingDish.id,
        data: {
          dishName: editingDish.dishName.trim(),
          dishTypeId: editingDish.dishTypeId,
        },
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Dish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Dish Name</label>
            <Input
              value={editingDish.dishName}
              onChange={e =>
                setEditingDish({ ...editingDish, dishName: e.target.value })
              }
              placeholder="Enter dish name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dish Type</label>
            <Select
              value={editingDish.dishTypeId.toString()}
              onValueChange={value =>
                setEditingDish({
                  ...editingDish,
                  dishTypeId: Number.parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dishTypes.map(type => (
                  <SelectItem
                    key={type.dishTypeId}
                    value={type.dishTypeId.toString()}
                  >
                    <div className="flex items-center gap-2">
                      {getDishIcon(type.dishTypeId, dishTypes)}
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editingDish.dishName.trim() || isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Dish'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
