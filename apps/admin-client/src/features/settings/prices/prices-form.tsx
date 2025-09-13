'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useGetSystemDishTypes,
  useGetRestaurantDishTypes,
  useUpdateRestaurantDishTypes,
  UpdateRestaurantDishTypesDto,
  getGetRestaurantDishTypesQueryKey,
} from '@mono-repo/api-client';
import { Badge } from '@mono-repo/ui/badge';
import { Button } from '@mono-repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@mono-repo/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mono-repo/ui/form';
import { Input } from '@mono-repo/ui/input';
import { Separator } from '@mono-repo/ui/separator';
import { Switch } from '@mono-repo/ui/switch';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Zod validation schema for the form
const dishTypeSettingSchema = z.object({
  dishTypeId: z.number(),
  price: z.number().min(0, 'Price must be positive'),
  isActive: z.boolean(),
  isOnTheMenu: z.boolean(),
});

const dishTypeSettingsSchema = z.object({
  settings: z.array(dishTypeSettingSchema),
});

type DishTypeSettingsFormData = z.infer<typeof dishTypeSettingsSchema>;

export default function DishTypeSettingsForm() {
  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  // Fetch master list and restaurant-specific settings in parallel
  const { data: systemDishTypes, isLoading: isLoadingSystem } =
    useGetSystemDishTypes();
  const { data: restaurantSettings, isLoading: isLoadingRestaurant } =
    useGetRestaurantDishTypes();

  // --- MUTATION ---
  // Hook for updating the settings
  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateRestaurantDishTypes({
      mutation: {
        onSuccess: () => {
          // Invalidate query to refetch fresh data after a successful update
          queryClient.invalidateQueries({
            queryKey: getGetRestaurantDishTypesQueryKey(),
          });
          toast.success('Dish type settings updated successfully!');
        },
        onError: error => {
          toast.error(`Failed to update settings: ${error.message}`);
        },
      },
    });

  const form = useForm<DishTypeSettingsFormData>({
    resolver: zodResolver(dishTypeSettingsSchema),
    defaultValues: {
      settings: [],
    },
  });

  // --- FORM INITIALIZATION ---
  // This effect runs when data is fetched, merging the two sources to populate the form
  useEffect(() => {
    // Ensure both data sources are loaded before processing
    if (systemDishTypes && restaurantSettings) {
      const formSettings = systemDishTypes.map(systemType => {
        const existingSetting = restaurantSettings.find(
          setting => setting.dishTypeId === systemType.dishTypeId
        );

        return {
          dishTypeId: systemType.dishTypeId,
          price: existingSetting?.price || 0,
          isActive: existingSetting?.isActive || false,
          isOnTheMenu: existingSetting?.isOnTheMenu || false,
        };
      });

      form.reset({ settings: formSettings });
    }
  }, [systemDishTypes, restaurantSettings, form]);

  // --- EVENT HANDLERS ---
  const onSubmit = (formData: DishTypeSettingsFormData) => {
    // Prepare the data to match the API's DTO
    const updateData: UpdateRestaurantDishTypesDto = {
      settings: formData.settings,
    };
    updateSettings({ data: updateData });
  };

  const handleReset = () => {
    if (systemDishTypes && restaurantSettings) {
      const formSettings = systemDishTypes.map(systemType => {
        const existingSetting = restaurantSettings.find(
          setting => setting.dishTypeId === systemType.dishTypeId
        );
        return {
          dishTypeId: systemType.dishTypeId,
          price: existingSetting?.price || 0,
          isActive: existingSetting?.isActive || false,
          isOnTheMenu: existingSetting?.isOnTheMenu || false,
        };
      });
      form.reset({ settings: formSettings });
      toast.info('Form has been reset to the last saved state.');
    }
  };

  const isLoading = isLoadingSystem || isLoadingRestaurant;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-muted-foreground">
          Loading dish type settings...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Dish Type Settings
        </h2>
        <p className="text-muted-foreground">
          Configure pricing and visibility for each dish type in your
          restaurant.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            {systemDishTypes?.map((dishType, index) => {
              const setting = form.watch(`settings.${index}`);

              return (
                <Card key={dishType.dishTypeId} className="relative w-full">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base font-medium">
                          {dishType.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {setting?.isActive && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                          {setting?.isOnTheMenu && (
                            <Badge variant="outline" className="text-xs">
                              On Menu
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting?.isActive ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-3">
                    <div className="flex items-center gap-6">
                      {/* Price Field */}
                      <FormField
                        control={form.control}
                        name={`settings.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="flex-shrink-0">
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Price (in Forint)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-24"
                                disabled={isUpdating}
                                onChange={e =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Active Switch */}
                      <FormField
                        control={form.control}
                        name={`settings.${index}.isActive`}
                        render={({ field }) => (
                          <FormItem className="flex-shrink-0">
                            <FormLabel className="text-sm font-medium">
                              Active
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isUpdating}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {field.value ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* On Menu Switch */}
                      <FormField
                        control={form.control}
                        name={`settings.${index}.isOnTheMenu`}
                        render={({ field }) => (
                          <FormItem className="flex-shrink-0">
                            <FormLabel className="text-sm font-medium">
                              On Menu
                            </FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isUpdating || !setting?.isActive}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {field.value ? 'Visible' : 'Hidden'}
                                </span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`settings.${index}.dishTypeId`}
                      render={({ field }) => (
                        <input
                          type="hidden"
                          {...field}
                          value={dishType.dishTypeId}
                        />
                      )}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isUpdating}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
