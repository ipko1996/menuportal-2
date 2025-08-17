import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mono-repo/ui';
import { useCreateDish } from '@mono-repo/api-client';
import type {
  DishResponseDto,
  DishTypeResponseDto,
} from '@mono-repo/api-client';
import { getDishIcon } from '@/components/dish-autocomplete';
import { useInvalidateDishes } from '../hooks/use-invalidate-dishes';

interface CreateDishDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dishTypes: DishTypeResponseDto[];
}

export function CreateDishDialog({
  isOpen,
  onOpenChange,
  dishTypes,
}: CreateDishDialogProps) {
  const [newDishName, setNewDishName] = useState('');
  const [newDishTypeId, setNewDishTypeId] = useState('');

  const { mutate: createDish, isPending: isCreating } = useCreateDish({
    mutation: useInvalidateDishes('Dish created successfully'),
  });

  const handleCreate = () => {
    if (newDishName.trim() && newDishTypeId) {
      createDish({
        data: {
          dishName: newDishName.trim(),
          dishTypeId: Number.parseInt(newDishTypeId),
        },
      });
      setNewDishName('');
      setNewDishTypeId('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Dish
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Dish</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Dish Name</label>
            <Input
              value={newDishName}
              onChange={e => setNewDishName(e.target.value)}
              placeholder="Enter dish name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dish Type</label>
            <Select value={newDishTypeId} onValueChange={setNewDishTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dish type" />
              </SelectTrigger>
              <SelectContent>
                {dishTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    <div className="flex items-center gap-2">
                      {getDishIcon(type.id, dishTypes)}
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newDishName.trim() || !newDishTypeId || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Dish'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
