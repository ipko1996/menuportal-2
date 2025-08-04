import { RestaurantSelect, UserSelect } from '@/schema';

type BaseUser = {
  db: Pick<UserSelect, 'id' | 'externalId'>;
  restaurant?: RestaurantSelect | null;
};

export type AppUser<T extends 'ADMIN' | 'MANAGER' | 'CUSTOMER' = 'CUSTOMER'> =
  T extends 'CUSTOMER'
    ? BaseUser
    : BaseUser & {
        restaurant: RestaurantSelect;
      };
