import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import {
  Check,
  ChevronDown,
  Plus,
  Pizza,
  Salad,
  Fish,
  Beef,
  Soup,
  Cake,
  ForkKnife,
  Utensils,
} from 'lucide-react';
import { Button, cn, Input } from '@mono-repo/ui';
import {
  useCreateDish,
  useGetDishById,
  useSearchDishesByName,
  useGetAvailableDishtypes,
  DishTypeResponseDto,
  DishResponseDto,
} from '@mono-repo/api-client';

interface DishAutocompleteProps {
  value: number;
  onChange: (dishId: number) => void;
  placeholder?: string;
  openOnFocus?: boolean;
}

const getDishIcon = (
  dishTypeId: number,
  dishTypes: DishTypeResponseDto[] = []
) => {
  const dishType = dishTypes.find(type => type.id === dishTypeId);
  if (!dishType) return <Pizza className="h-4 w-4" />;

  switch (dishType.dishTypeValue) {
    case 'SOUP':
    case 'MEAT_SOUP':
      return <Soup className="h-4 w-4" />;
    case 'MAIN_DISH':
      return <Utensils className="h-4 w-4" />;
    case 'SALAD':
      return <Salad className="h-4 w-4" />;
    case 'FISH':
      return <Fish className="h-4 w-4" />;
    case 'DESSERT':
      return <Cake className="h-4 w-4" />;
    default:
      return <Pizza className="h-4 w-4" />;
  }
};

export function DishAutocomplete({
  value,
  onChange,
  placeholder = 'Search dishes...',
  openOnFocus = false,
}: DishAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: dishTypes = [], isLoading: dishTypesLoading } =
    useGetAvailableDishtypes();

  const { data: dish, isLoading: dishLoading } = useGetDishById(value, {
    query: {
      enabled: value > 0,
    },
  });

  const { mutate: createDish, isPending: isCreating } = useCreateDish({
    mutation: {
      onSuccess: (newDish: DishResponseDto) => {
        onChange(newDish.id);
        setSearchTerm(newDish.dishName);
        setIsOpen(false);
      },
      onError: error => {
        console.error('Failed to create dish:', error);
      },
    },
  });

  const { data: dishes = [], isLoading: dishesLoading } = useSearchDishesByName(
    { name: debouncedSearchTerm },
    {
      query: {
        enabled: isOpen && debouncedSearchTerm.length > 0,
      },
    }
  );

  const filteredDishes = dishes.filter(dish =>
    dish.dishName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const selectedDish = dishes.find(dish => dish.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (dish: DishResponseDto) => {
    onChange(dish.id);
    setSearchTerm(dish.dishName);
    setIsOpen(false);
  };

  const handleAddNewDish = () => {
    if (searchTerm.trim() && dishTypes.length > 0) {
      // Find main course dish type
      const defaultDishType = dishTypes.find(
        type => type.dishTypeValue === 'MAIN_DISH'
      );

      if (!defaultDishType) {
        throw new Error('No main dish type found');
      }

      createDish({
        data: {
          dishName: searchTerm,
          dishTypeId: defaultDishType.id,
        },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (openOnFocus) {
      setIsOpen(true);
    }
  };

  const hasExactMatch = filteredDishes.some(
    dish => dish.dishName.toLowerCase() === debouncedSearchTerm.toLowerCase()
  );

  const showAddButton = searchTerm.trim() && !hasExactMatch && !isCreating;

  // Show loading state when debouncing is happening
  const isSearching =
    searchTerm !== debouncedSearchTerm && searchTerm.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {dishLoading || isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent" />
          ) : (
            <Pizza className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={
            (isOpen
              ? searchTerm
              : selectedDish?.dishName || searchTerm || dish?.dishName) ?? ''
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={
            dishLoading
              ? 'Loading dish...'
              : isSearching
              ? 'Searching...'
              : placeholder
          }
          className="pl-10 pr-8"
          autoFocus={false}
          disabled={dishTypesLoading || dishLoading}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => setIsOpen(!isOpen)}
          disabled={dishTypesLoading || dishLoading}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>
      {isOpen && !dishLoading && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {dishTypesLoading ? (
            <div className="p-2 text-sm text-muted-foreground">
              Loading dish types...
            </div>
          ) : dishesLoading || isSearching ? (
            <div className="p-2 text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent" />
              Searching dishes...
            </div>
          ) : filteredDishes.length === 0 && !showAddButton ? (
            <div className="p-2 text-sm text-muted-foreground">
              No dishes found
            </div>
          ) : (
            <>
              {filteredDishes.map(dish => (
                <button
                  key={dish.id}
                  type="button"
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between',
                    value === dish.id && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => handleSelect(dish)}
                >
                  <div className="flex items-center gap-2">
                    {getDishIcon(dish.dishTypeId, dishTypes)}
                    <span>{dish.dishName}</span>
                  </div>
                  {value === dish.id && <Check className="h-4 w-4" />}
                </button>
              ))}
              {showAddButton && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-t"
                  onClick={handleAddNewDish}
                  disabled={isCreating}
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {isCreating ? 'Adding...' : `Add "${searchTerm}"`}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
