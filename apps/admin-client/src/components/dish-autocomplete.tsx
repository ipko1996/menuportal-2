import type React from 'react';

import { useState, useEffect, useRef } from 'react';

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
} from 'lucide-react';
import { Button, cn, Input } from '@mono-repo/ui';

interface Dish {
  id: number;
  name: string;
  type: 'appetizer' | 'soup' | 'main' | 'dessert' | 'beverage' | 'side';
}

interface DishAutocompleteProps {
  value: number;
  onChange: (dishId: number) => void;
  placeholder?: string;
  openOnFocus?: boolean;
}

let mockDishes: Dish[] = [
  { id: 1, name: 'Margherita Pizza', type: 'main' },
  { id: 2, name: 'Caesar Salad', type: 'appetizer' },
  { id: 3, name: 'Grilled Salmon', type: 'main' },
  { id: 4, name: 'Beef Burger', type: 'main' },
  { id: 5, name: 'Chicken Tikka Masala', type: 'main' },
  { id: 6, name: 'Vegetable Stir Fry', type: 'side' },
  { id: 7, name: 'Chocolate Cake', type: 'dessert' },
  { id: 8, name: 'Fish and Chips', type: 'main' },
  { id: 9, name: 'Pasta Carbonara', type: 'main' },
  { id: 10, name: 'Greek Salad', type: 'appetizer' },
  { id: 11, name: 'Tomato Soup', type: 'soup' },
  { id: 12, name: 'Ice Cream', type: 'dessert' },
];

const getDishIcon = (type: Dish['type']) => {
  switch (type) {
    case 'appetizer':
      return <Salad className="h-4 w-4" />;
    case 'soup':
      return <Soup className="h-4 w-4" />;
    case 'main':
      return <Pizza className="h-4 w-4" />;
    case 'dessert':
      return <Cake className="h-4 w-4" />;
    case 'beverage':
      return <Fish className="h-4 w-4" />;
    case 'side':
      return <Beef className="h-4 w-4" />;
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
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>(mockDishes);
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedDish = dishes.find(dish => dish.id === value);

  useEffect(() => {
    const filtered = dishes.filter(dish =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDishes(filtered);
  }, [searchTerm, dishes]);

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

  const handleSelect = (dish: Dish) => {
    onChange(dish.id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleAddNewDish = () => {
    if (searchTerm.trim()) {
      const newId = Math.max(...dishes.map(d => d.id)) + 1;
      const newDish: Dish = {
        id: newId,
        name: searchTerm.trim(),
        type: 'main',
      };

      const updatedDishes = [...dishes, newDish];
      setDishes(updatedDishes);
      mockDishes = updatedDishes;

      onChange(newDish.id);
      setSearchTerm('');
      setIsOpen(false);

      console.log('Added new dish:', newDish);
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
    dish => dish.name.toLowerCase() === searchTerm.toLowerCase()
  );
  const showAddButton = searchTerm.trim() && !hasExactMatch;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Pizza className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedDish?.name || ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 pr-8"
          autoFocus={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {filteredDishes.length === 0 && !showAddButton ? (
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
                    {getDishIcon(dish.type)}
                    <span>{dish.name}</span>
                  </div>
                  {value === dish.id && <Check className="h-4 w-4" />}
                </button>
              ))}

              {showAddButton && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-t"
                  onClick={handleAddNewDish}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add "{searchTerm}"</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
