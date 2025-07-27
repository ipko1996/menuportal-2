import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { addOn } from './add-on';
import { offer } from './offer';

export const offerAddOn = pgTable(
  'offer_add_on',
  {
    offerId: integer('offer_id')
      .notNull()
      .references(() => offer.id),
    addOnId: integer('add_on_id')
      .notNull()
      .references(() => addOn.id),
  },
  (table) => [primaryKey({ columns: [table.offerId, table.addOnId] })]
);

export const offerAddOnRelations = relations(offerAddOn, ({ one }) => ({
  offer: one(offer, {
    fields: [offerAddOn.offerId],
    references: [offer.id],
  }),
  addOn: one(addOn, {
    fields: [offerAddOn.addOnId],
    references: [addOn.id],
  }),
}));
