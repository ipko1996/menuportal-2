import { useState } from 'react';
import { Edit, Filter, Search, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@mono-repo/ui';
import {
  DishTypeWithDataResponseDto,
  useUpdateDishById,
  type DishResponseDto,
  type DishTypeResponseDto,
} from '@mono-repo/api-client';
import { getDishIcon } from '@/components/dish-autocomplete';
import { useInvalidateDishes } from '../hooks/use-invalidate-dishes';

interface DishTableProps {
  dishes: DishResponseDto[];
  isSearching: boolean;
  dishTypes: DishTypeWithDataResponseDto[];
  itemsPerPage: number;
  totalFilteredDishes: number;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedTypeFilter: string;
  onTypeFilterChange: (filter: string) => void;
  onOpenEditDialog: (dish: DishResponseDto) => void;
  onOpenDeleteDialog: (dish: DishResponseDto) => void;
}

export function DishTable({
  dishes,
  isSearching,
  dishTypes,
  itemsPerPage,
  totalFilteredDishes,
  searchTerm,
  onSearchChange,
  selectedTypeFilter,
  onTypeFilterChange,
  onOpenEditDialog,
  onOpenDeleteDialog,
}: DishTableProps) {
  const [editingDish, setEditingDish] = useState<DishResponseDto | null>(null);

  const { mutate: updateDish, isPending: isUpdating } = useUpdateDishById({
    mutation: useInvalidateDishes('Dish updated successfully'),
  });

  const startInlineEdit = (dish: DishResponseDto) => {
    setEditingDish({ ...dish });
  };

  const saveInlineEdit = () => {
    if (editingDish && editingDish.dishName.trim()) {
      updateDish({
        id: editingDish.id,
        data: {
          dishName: editingDish.dishName.trim(),
          dishTypeId: editingDish.dishTypeId,
        },
      });
    }
    setEditingDish(null);
  };

  const cancelInlineEdit = () => {
    setEditingDish(null);
  };

  const handleTypeChange = (dishId: number, newTypeId: string) => {
    const dishToUpdate = dishes.find(d => d.id === dishId);
    if (dishToUpdate) {
      updateDish({
        id: dishId,
        data: {
          dishName: dishToUpdate.dishName,
          dishTypeId: Number.parseInt(newTypeId),
        },
      });
    }
  };

  const SkeletonRow = () => (
    <TableRow className="h-12">
      <TableCell className="text-center w-12">
        <div className="flex justify-center">
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </TableCell>
      <TableCell className="w-80">
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell className="w-40">
        <Skeleton className="h-8 w-32" />
      </TableCell>
      <TableCell>
        <div className="flex gap-1 justify-center">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedTypeFilter}
                onValueChange={onTypeFilterChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">Icon</TableHead>
                <TableHead className="w-80">Dish Name</TableHead>
                <TableHead className="w-40">Type</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching
                ? Array.from({ length: itemsPerPage }, (_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : dishes.map(dish => (
                    <TableRow key={dish.id} className="h-12">
                      <TableCell className="text-center w-12">
                        <div className="flex justify-center">
                          {getDishIcon(dish.dishTypeId, dishTypes)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium w-80">
                        {editingDish && editingDish.id === dish.id ? (
                          <div className="flex items-center gap-1 w-full">
                            <Input
                              value={editingDish.dishName}
                              onChange={e =>
                                setEditingDish({
                                  ...editingDish,
                                  dishName: e.target.value,
                                })
                              }
                              className="h-8 text-sm flex-1 min-w-0"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveInlineEdit();
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveInlineEdit}
                              className="h-8 w-6 p-0 text-green-600 hover:text-green-700 flex-shrink-0"
                            >
                              ✓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelInlineEdit}
                              className="h-8 w-6 p-0 text-red-600 hover:text-red-700 flex-shrink-0"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-muted px-2 py-1 rounded block truncate"
                            onClick={() => startInlineEdit(dish)}
                            title="Click to edit"
                          >
                            {dish.dishName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="w-40">
                        <Select
                          value={dish.dishTypeId.toString()}
                          onValueChange={value =>
                            handleTypeChange(dish.id, value)
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 text-xs w-36">
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
                                  <span className="text-xs">{type.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenEditDialog(dish)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenDeleteDialog(dish)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {!isSearching && totalFilteredDishes === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No dishes found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
