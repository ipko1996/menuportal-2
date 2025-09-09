CREATE TYPE "public"."day_name" AS ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');--> statement-breakpoint
CREATE TYPE "public"."dish_type_value" AS ENUM('SOUP', 'MEAT_SOUP', 'MAIN_DISH', 'SIDE_DISH', 'SALAD', 'VEGETABLE_STEW', 'DESSERT', 'DRINK', 'KIDS_MENU', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'FISH', 'PASTA', 'GRILLED', 'BREAKFAST', 'DAILY_MENU');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('MENU', 'OFFER', 'HOLIDAY');--> statement-breakpoint
CREATE TYPE "public"."failure_reason" AS ENUM('API_ERROR', 'AUTHENTICATION_FAILED', 'RATE_LIMIT_EXCEEDED', 'INVALID_CONTENT', 'NETWORK_ERROR', 'PLATFORM_UNAVAILABLE', 'INSUFFICIENT_PERMISSIONS', 'CONTENT_POLICY_VIOLATION', 'OTHER', 'UNKNOWN_ERROR');--> statement-breakpoint
CREATE TYPE "public"."menu_status" AS ENUM('SCHEDULED', 'PUBLISHED', 'FAILED', 'PUBLISHING');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('WEEKLY', 'DAILY');--> statement-breakpoint
CREATE TYPE "public"."social_media_platform" AS ENUM('FACEBOOK', 'INSTAGRAM', 'TWITTER');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MANAGER', 'CUSTOMER');--> statement-breakpoint
CREATE TABLE "add_on" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric(5, 0) NOT NULL,
	"restaurant_id" integer NOT NULL,
	CONSTRAINT "add_on_restaurant_name_idx" UNIQUE("name","restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" serial NOT NULL,
	"date" date NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "availability_entity_type_entity_id_date_pk" PRIMARY KEY("entity_type","entity_id","date")
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_of_week" "day_name" NOT NULL,
	"opening_time" time NOT NULL,
	"closing_time" time NOT NULL,
	"restaurant_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dish" (
	"id" serial PRIMARY KEY NOT NULL,
	"dish_name" varchar NOT NULL,
	"restaurant_id" serial NOT NULL,
	"dish_type_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dish_name_restaurant_unique" UNIQUE("dish_name","restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "dish_menu" (
	"dish_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"dish_type_id" integer NOT NULL,
	CONSTRAINT "dish_menu_dish_id_menu_id_pk" PRIMARY KEY("dish_id","menu_id"),
	CONSTRAINT "unique_dish_type_per_menu" UNIQUE("menu_id","dish_type_id")
);
--> statement-breakpoint
CREATE TABLE "dish_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"dishTypeName" varchar NOT NULL,
	"dishTypeValue" "dish_type_value" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holiday" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"restaurant_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" serial NOT NULL,
	"menuName" varchar NOT NULL,
	"price" numeric(5, 0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"dish_id" integer NOT NULL,
	"price" numeric(5, 0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_add_on" (
	"offer_id" integer NOT NULL,
	"add_on_id" integer NOT NULL,
	CONSTRAINT "offer_add_on_offer_id_add_on_id_pk" PRIMARY KEY("offer_id","add_on_id")
);
--> statement-breakpoint
CREATE TABLE "restaurant" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"address" varchar NOT NULL,
	"takeaway_price" numeric(5, 0),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurant_dish_type" (
	"restaurant_id" integer NOT NULL,
	"dish_type_id" integer NOT NULL,
	"price" numeric(5, 0) NOT NULL,
	CONSTRAINT "dish_type_restaurant_unique" UNIQUE("dish_type_id","restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "restaurant_setting" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	CONSTRAINT "restaurant_id_unique" UNIQUE("restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "platform_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"schedule_id" integer NOT NULL,
	"social_media_account_id" integer NOT NULL,
	"template_id" text,
	"content_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_schedule_social_account" UNIQUE("schedule_id","social_media_account_id")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"schedule_type" "schedule_type" NOT NULL,
	"cron_expression" text NOT NULL,
	"default_template_id" text,
	"default_content_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_restaurant_schedule_type" UNIQUE("restaurant_id","schedule_type")
);
--> statement-breakpoint
CREATE TABLE "snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"original_id" integer,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshot_holiday" (
	"snapshot_id" integer PRIMARY KEY NOT NULL,
	"original_holiday_id" integer,
	"holiday_name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshot_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" integer NOT NULL,
	"original_dish_id" integer,
	"dish_name" varchar NOT NULL,
	"dish_type_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"position" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshot_menu" (
	"snapshot_id" integer PRIMARY KEY NOT NULL,
	"original_menu_id" integer,
	"menu_name" varchar NOT NULL,
	"price" numeric(5, 0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshot_offer" (
	"snapshot_id" integer PRIMARY KEY NOT NULL,
	"original_offer_id" integer,
	"price" numeric(5, 0) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" serial PRIMARY KEY NOT NULL,
	"social_media_account_id" integer NOT NULL,
	"platform_schedule_id" integer,
	"status" "menu_status" DEFAULT 'SCHEDULED' NOT NULL,
	"content" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"posted_at" timestamp with time zone,
	"post_url" text,
	"generated_image_url" text,
	"generated_pdf_url" text,
	"failure_reason" "failure_reason",
	"failure_reason_details" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_account_schedule_time" UNIQUE("social_media_account_id","scheduled_at")
);
--> statement-breakpoint
CREATE TABLE "post_snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"snapshot_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_post_snapshot" UNIQUE("post_id","snapshot_id")
);
--> statement-breakpoint
CREATE TABLE "social_account" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"platform" "social_media_platform" NOT NULL,
	"platform_account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"token_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "unique_restaurant_platform_idx" UNIQUE("restaurant_id","platform")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_user_id" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_restaurant" (
	"user_id" uuid NOT NULL,
	"restaurant_id" integer NOT NULL,
	CONSTRAINT "user_restaurant_restaurant_id_user_id_pk" PRIMARY KEY("restaurant_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "add_on" ADD CONSTRAINT "add_on_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish" ADD CONSTRAINT "dish_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish" ADD CONSTRAINT "dish_dish_type_id_dish_type_id_fk" FOREIGN KEY ("dish_type_id") REFERENCES "public"."dish_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_menu" ADD CONSTRAINT "dish_menu_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_menu" ADD CONSTRAINT "dish_menu_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_menu" ADD CONSTRAINT "dish_menu_dish_type_id_dish_type_id_fk" FOREIGN KEY ("dish_type_id") REFERENCES "public"."dish_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday" ADD CONSTRAINT "holiday_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer" ADD CONSTRAINT "offer_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer" ADD CONSTRAINT "offer_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_add_on" ADD CONSTRAINT "offer_add_on_offer_id_offer_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_add_on" ADD CONSTRAINT "offer_add_on_add_on_id_add_on_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_on"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_dish_type" ADD CONSTRAINT "restaurant_dish_type_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_dish_type" ADD CONSTRAINT "restaurant_dish_type_dish_type_id_dish_type_id_fk" FOREIGN KEY ("dish_type_id") REFERENCES "public"."dish_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_setting" ADD CONSTRAINT "restaurant_setting_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_schedules" ADD CONSTRAINT "platform_schedules_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_schedules" ADD CONSTRAINT "platform_schedules_social_media_account_id_social_account_id_fk" FOREIGN KEY ("social_media_account_id") REFERENCES "public"."social_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot" ADD CONSTRAINT "snapshot_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_holiday" ADD CONSTRAINT "snapshot_holiday_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_holiday" ADD CONSTRAINT "snapshot_holiday_original_holiday_id_holiday_id_fk" FOREIGN KEY ("original_holiday_id") REFERENCES "public"."holiday"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_item" ADD CONSTRAINT "snapshot_item_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_item" ADD CONSTRAINT "snapshot_item_original_dish_id_dish_id_fk" FOREIGN KEY ("original_dish_id") REFERENCES "public"."dish"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_item" ADD CONSTRAINT "snapshot_item_dish_type_id_dish_type_id_fk" FOREIGN KEY ("dish_type_id") REFERENCES "public"."dish_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_item" ADD CONSTRAINT "snapshot_item_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_menu" ADD CONSTRAINT "snapshot_menu_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshot_offer" ADD CONSTRAINT "snapshot_offer_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_social_media_account_id_social_account_id_fk" FOREIGN KEY ("social_media_account_id") REFERENCES "public"."social_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_platform_schedule_id_platform_schedules_id_fk" FOREIGN KEY ("platform_schedule_id") REFERENCES "public"."platform_schedules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_snapshot" ADD CONSTRAINT "post_snapshot_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_snapshot" ADD CONSTRAINT "post_snapshot_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_account" ADD CONSTRAINT "social_account_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_restaurant" ADD CONSTRAINT "user_restaurant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_restaurant" ADD CONSTRAINT "user_restaurant_restaurant_id_restaurant_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "add_on_name_idx" ON "add_on" USING btree ("name");--> statement-breakpoint
CREATE INDEX "availability_date_idx" ON "availability" USING btree ("date");--> statement-breakpoint
CREATE INDEX "availability_range_idx" ON "availability" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "business_hours_restaurant_id_idx" ON "business_hours" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "dish_restaurant_id_idx" ON "dish" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "dish_dish_type_id_idx" ON "dish" USING btree ("dish_type_id");--> statement-breakpoint
CREATE INDEX "dish_name_idx" ON "dish" USING btree ("dish_name");--> statement-breakpoint
CREATE INDEX "dish_type_name_idx" ON "dish_type" USING btree ("dishTypeName");--> statement-breakpoint
CREATE INDEX "menu_name_idx" ON "menu" USING btree ("menuName");--> statement-breakpoint
CREATE INDEX "menu_restaurant_id_idx" ON "menu" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "offer_dish_id_idx" ON "offer" USING btree ("dish_id");--> statement-breakpoint
CREATE INDEX "restaurant_name_idx" ON "restaurant" USING btree ("name");--> statement-breakpoint
CREATE INDEX "restaurant_setting_restaurant_id_idx" ON "restaurant_setting" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "platform_schedules_schedule_idx" ON "platform_schedules" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "platform_schedules_account_idx" ON "platform_schedules" USING btree ("social_media_account_id");--> statement-breakpoint
CREATE INDEX "schedules_restaurant_idx" ON "schedules" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "schedules_type_idx" ON "schedules" USING btree ("schedule_type");--> statement-breakpoint
CREATE INDEX "snapshot_restaurant_created_idx" ON "snapshot" USING btree ("restaurant_id","created_at");--> statement-breakpoint
CREATE INDEX "snapshot_restaurant_date_idx" ON "snapshot" USING btree ("restaurant_id","date");--> statement-breakpoint
CREATE INDEX "snapshot_item_snapshot_idx" ON "snapshot_item" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "post_status_scheduled_idx" ON "post" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "post_snapshot_post_idx" ON "post_snapshot" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_snapshot_snapshot_idx" ON "post_snapshot" USING btree ("snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_external_id_idx" ON "user" USING btree ("external_user_id");