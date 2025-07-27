export const dishTypeValues = [
  'SOUP',
  'MEAT_SOUP',
  'MAIN_DISH',
  'SIDE_DISH',
  'SALAD',
  'VEGETABLE_STEW',
  'DESSERT',
  'DRINK',
  'KIDS_MENU',
  'VEGETARIAN',
  'VEGAN',
  'GLUTEN_FREE',
  'FISH',
  'PASTA',
  'GRILLED',
  'BREAKFAST',
  'DAILY_MENU',
] as const;

export type DishType = (typeof dishTypeValues)[number];
