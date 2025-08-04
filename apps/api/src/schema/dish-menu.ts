import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, unique } from 'drizzle-orm/pg-core';

import { dish } from './dish';
import { dishType } from './dish-type';
import { menu } from './menu';

export const dishMenu = pgTable(
  'dish_menu',
  {
    dishId: integer('dish_id')
      .notNull()
      .references(() => dish.id),
    menuId: integer('menu_id')
      .notNull()
      .references(() => menu.id),
    dishTypeId: integer('dish_type_id')
      .notNull()
      .references(() => dishType.id),
  },
  table => [
    primaryKey({ columns: [table.dishId, table.menuId] }),
    // We can't have a menu with two dishes of the same type e.g. two main dishes
    unique('unique_dish_type_per_menu').on(table.menuId, table.dishTypeId),
  ]
);

export const dishMenuRelations = relations(dishMenu, ({ one }) => ({
  dish: one(dish, {
    fields: [dishMenu.dishId],
    references: [dish.id],
  }),
  menu: one(menu, {
    fields: [dishMenu.menuId],
    references: [menu.id],
  }),
}));
