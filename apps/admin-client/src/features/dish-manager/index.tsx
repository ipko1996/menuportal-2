import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
} from '@mono-repo/ui';
import {
  DishResponseDto,
  GetPaginatedDishesParams,
  useGetPaginatedDishes,
} from '@mono-repo/api-client';
import { useDebounceValue } from 'usehooks-ts';
import { toast } from 'sonner';
import { useGetRestaurantDishTypes } from '@mono-repo/api-client';
import { CreateDishDialog } from './components/create-dish-dialog';
import { EditDishDialog } from './components/edit-dish-dialog';
import { DeleteDishDialog } from './components/delete-dish-dialog';
import { DishTable } from './components/dish-table';

export default function DishManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<DishResponseDto | null>(null);
  const [deletingDish, setDeletingDish] = useState<DishResponseDto | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: dishTypes = [], isLoading: dishTypesLoading } =
    useGetRestaurantDishTypes();

  const paginationParams: GetPaginatedDishesParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
      dishTypeId:
        selectedTypeFilter === 'all'
          ? undefined
          : Number.parseInt(selectedTypeFilter),
    }),
    [currentPage, itemsPerPage, debouncedSearchTerm, selectedTypeFilter]
  );

  const {
    data: dishesResponse,
    isLoading: isDishesLoading,
    error: dishesError,
  } = useGetPaginatedDishes(paginationParams);

  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedTypeFilter]);

  const openEditDialog = (dish: DishResponseDto) => {
    setEditingDish({ ...dish });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (dish: DishResponseDto) => {
    setDeletingDish(dish);
    setIsDeleteDialogOpen(true);
  };

  if (dishesError) {
    toast.error(`Failed to load dishes: ${dishesError.message}`);
  }

  const dishes = dishesResponse?.data || [];
  const meta = dishesResponse?.meta;
  const isSearching = isDishesLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dish Manager</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's dishes and menu items
          </p>
        </div>
        <CreateDishDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          dishTypes={dishTypes}
        />
      </div>

      <DishTable
        dishes={dishes}
        isSearching={isSearching}
        dishTypes={dishTypes}
        itemsPerPage={itemsPerPage}
        totalFilteredDishes={meta?.itemCount || 0}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTypeFilter={selectedTypeFilter}
        onTypeFilterChange={setSelectedTypeFilter}
        onOpenEditDialog={openEditDialog}
        onOpenDeleteDialog={openDeleteDialog}
      />

      {!isSearching && meta && meta.itemCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.itemCount)} of{' '}
            {meta.itemCount} dishes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!meta.hasPreviousPage}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.pageCount }, (_, i) => i + 1).map(
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
              disabled={!meta.hasNextPage}
              className="h-8"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {editingDish && (
        <EditDishDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          dish={editingDish}
          dishTypes={dishTypes}
        />
      )}

      {deletingDish && (
        <DeleteDishDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          dish={deletingDish}
        />
      )}
    </div>
  );
}
