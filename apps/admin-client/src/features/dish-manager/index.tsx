'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@mono-repo/ui';
import type {
  DishResponseDto,
  DishTypeResponseDto,
} from '@mono-repo/api-client';
import { useDebounceValue } from 'usehooks-ts';
import { getDishIcon } from '@/components/dish-autocomplete';
import { toast } from 'sonner';
import { useCreateDish, useGetAvailableDishtypes } from '@mono-repo/api-client';

const mockDishTypes: DishTypeResponseDto[] = [
  { id: 1, name: 'Soup', dishTypeValue: 'SOUP' },
  { id: 2, name: 'Meat Soup', dishTypeValue: 'MEAT_SOUP' },
  { id: 3, name: 'Main Dish', dishTypeValue: 'MAIN_DISH' },
  { id: 4, name: 'Side Dish', dishTypeValue: 'SIDE_DISH' },
  { id: 5, name: 'Salad', dishTypeValue: 'SALAD' },
  { id: 6, name: 'Vegetable Stew', dishTypeValue: 'VEGETABLE_STEW' },
  { id: 7, name: 'Dessert', dishTypeValue: 'DESSERT' },
  { id: 8, name: 'Drink', dishTypeValue: 'DRINK' },
  { id: 9, name: 'Fish', dishTypeValue: 'FISH' },
  { id: 10, name: 'Pasta', dishTypeValue: 'PASTA' },
];

const initialMockDishes: DishResponseDto[] = [
  { id: 1, dishName: 'Chicken Soup', dishTypeId: 1, restaurantId: 1 },
  { id: 2, dishName: 'Beef Steak', dishTypeId: 3, restaurantId: 1 },
  { id: 3, dishName: 'Caesar Salad', dishTypeId: 5, restaurantId: 1 },
  { id: 4, dishName: 'Grilled Salmon', dishTypeId: 9, restaurantId: 1 },
  { id: 5, dishName: 'Chocolate Cake', dishTypeId: 7, restaurantId: 1 },
  { id: 6, dishName: 'Mushroom Soup', dishTypeId: 1, restaurantId: 1 },
  { id: 7, dishName: 'Pasta Carbonara', dishTypeId: 10, restaurantId: 1 },
  { id: 8, dishName: 'Greek Salad', dishTypeId: 5, restaurantId: 1 },
  { id: 9, dishName: 'Tiramisu', dishTypeId: 7, restaurantId: 1 },
  { id: 10, dishName: 'Grilled Chicken', dishTypeId: 3, restaurantId: 1 },
];

export default function DishManager() {
  const [dishes, setDishes] = useState<DishResponseDto[]>(initialMockDishes);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<DishResponseDto | null>(null);
  const [deletingDish, setDeletingDish] = useState<DishResponseDto | null>(
    null
  );
  const [newDishName, setNewDishName] = useState('');
  const [newDishTypeId, setNewDishTypeId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const dishTypes = mockDishTypes;

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesSearch = dish.dishName
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesType =
        selectedTypeFilter === 'all' ||
        dish.dishTypeId.toString() === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [dishes, debouncedSearchTerm, selectedTypeFilter]);

  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDishes = filteredDishes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedTypeFilter]);

  const getDishTypeName = (dishTypeId: number) => {
    const dishType = dishTypes.find(type => type.id === dishTypeId);
    return dishType?.name || 'Unknown';
  };

  const handleCreateDish = () => {
    if (newDishName.trim() && newDishTypeId) {
      const newDish: DishResponseDto = {
        id: Math.max(...dishes.map(d => d.id)) + 1,
        dishName: newDishName.trim(),
        dishTypeId: Number.parseInt(newDishTypeId),
        restaurantId: 1, // Assuming a single restaurant for simplicity
      };

      setDishes(prev => [...prev, newDish]);
      toast.success('Dish created successfully');
      setIsCreateDialogOpen(false);
      setNewDishName('');
      setNewDishTypeId('');
    }
  };

  const handleUpdateDish = () => {
    if (editingDish && editingDish.dishName.trim() && editingDish.dishTypeId) {
      setDishes(prev =>
        prev.map(dish =>
          dish.id === editingDish.id
            ? {
                ...dish,
                dishName: editingDish.dishName.trim(),
                dishTypeId: editingDish.dishTypeId,
              }
            : dish
        )
      );
      toast.success('Dish updated successfully');
      setIsEditDialogOpen(false);
      setEditingDish(null);
    }
  };

  const handleDeleteDish = () => {
    if (deletingDish) {
      setDishes(prev => prev.filter(dish => dish.id !== deletingDish.id));
      toast.success(`Dish "${deletingDish.dishName}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDeletingDish(null);
    }
  };

  const openEditDialog = (dish: DishResponseDto) => {
    setEditingDish({ ...dish });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (dish: DishResponseDto) => {
    setDeletingDish(dish);
    setIsDeleteDialogOpen(true);
  };

  const startInlineEdit = (dish: DishResponseDto) => {
    setEditingDish({ ...dish });
  };

  const saveInlineEdit = () => {
    if (editingDish && editingDish.dishName.trim()) {
      setDishes(prev =>
        prev.map(dish =>
          dish.id === editingDish.id
            ? { ...dish, dishName: editingDish.dishName.trim() }
            : dish
        )
      );
      toast.success('Dish name updated successfully');
    }
    setEditingDish(null);
  };

  const cancelInlineEdit = () => {
    setEditingDish(null);
  };

  const handleTypeChange = (dishId: number, newTypeId: string) => {
    setDishes(prev =>
      prev.map(dish =>
        dish.id === dishId
          ? { ...dish, dishTypeId: Number.parseInt(newTypeId) }
          : dish
      )
    );
    toast.success(`Dish type updated successfully`);
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dish Manager</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's dishes and menu items
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDish}
                  disabled={!newDishName.trim() || !newDishTypeId}
                >
                  Create Dish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedTypeFilter}
                onValueChange={setSelectedTypeFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
                : paginatedDishes.map(dish => (
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
                        >
                          <SelectTrigger className="h-8 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dishTypes.map(type => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  {getDishIcon(type.id, dishTypes)}
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
                            onClick={() => openEditDialog(dish)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(dish)}
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

          {!isSearching && filteredDishes.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                {debouncedSearchTerm || selectedTypeFilter !== 'all'
                  ? 'No dishes found matching your criteria'
                  : 'No dishes available. Create your first dish to get started.'}
              </p>
            </div>
          )}

          {!isSearching && filteredDishes.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredDishes.length)} of{' '}
                {filteredDishes.length} dishes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dish</DialogTitle>
          </DialogHeader>
          {editingDish && (
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateDish}
                  disabled={!editingDish.dishName.trim()}
                >
                  Update Dish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dish</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDish?.dishName}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDish}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
