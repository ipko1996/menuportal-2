ALTER TABLE "restaurant_dish_type" DROP CONSTRAINT "dish_type_restaurant_unique";--> statement-breakpoint
ALTER TABLE "restaurant_dish_type" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant_dish_type" ADD COLUMN "is_on_the_menu" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant_setting" ADD COLUMN "menu_price" numeric(5, 0);--> statement-breakpoint
ALTER TABLE "restaurant_setting" ADD COLUMN "takeaway_price" numeric(5, 0);--> statement-breakpoint
ALTER TABLE "restaurant" DROP COLUMN "takeaway_price";--> statement-breakpoint
ALTER TABLE "restaurant_dish_type" ADD CONSTRAINT "dish_type_restaurant_unique" UNIQUE("restaurant_id","dish_type_id");