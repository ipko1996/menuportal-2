import { relations } from 'drizzle-orm';
import { bigint, pgTable, primaryKey, unique } from 'drizzle-orm/pg-core';

import { dish } from './dish';
import { dishType } from './dish-type';
import { menu } from './menu';

export const dishMenu = pgTable(
  'dish_menu',
  {
    dishId: bigint('dish_id', { mode: 'number' })
      .notNull()
      .references(() => dish.id),
    menuId: bigint('menu_id', { mode: 'number' })
      .notNull()
      .references(() => menu.id),
    dishTypeId: bigint('dish_type_id', { mode: 'number' })
      .notNull()
      .references(() => dishType.id),
  },
  (table) => [
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
