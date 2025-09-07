import { zodResolver } from '@hookform/resolvers/zod';
import {
  useFindRestaurantSettings,
  useUpdateRestaurantSettings,
  getFindRestaurantSettingsQueryKey,
  RestaurantDto,
  UpdateRestaurantSettingDto,
} from '@mono-repo/api-client';
import { Button } from '@mono-repo/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mono-repo/ui/form';
import { Input } from '@mono-repo/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Zod validation schema
const restaurantSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Restaurant name is required')
    .max(100, 'Name must be less than 100 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  // .regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),
  takeawayPrice: z
    .number()
    .min(0, 'Takeaway price must be positive')
    .optional()
    .or(z.literal('')),
});

type RestaurantSettingsFormData = z.infer<typeof restaurantSettingsSchema>;

export function RestaurantSettingsForm() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useFindRestaurantSettings();
  const { mutate: updateRestaurantSettings } = useUpdateRestaurantSettings({
    mutation: {
      onSuccess: data => {
        queryClient.invalidateQueries({
          queryKey: getFindRestaurantSettingsQueryKey(),
        });
        toast.success('Restaurant settings updated successfully');
      },
      onError: error => {
        toast.error(`Error updating restaurant settings: ${error.message}`);
      },
    },
  });

  const form = useForm<RestaurantSettingsFormData>({
    resolver: zodResolver(restaurantSettingsSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      address: '',
      takeawayPrice: undefined,
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        takeawayPrice: data.takeawayPrice || undefined,
      });
    }
  }, [data, form]);

  const onSubmit = (formData: RestaurantSettingsFormData) => {
    const updateData: UpdateRestaurantSettingDto = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      takeawayPrice:
        formData.takeawayPrice === ''
          ? undefined
          : Number(formData.takeawayPrice),
    };

    updateRestaurantSettings({
      data: updateData,
    });
  };

  const handleReset = () => {
    if (data) {
      form.reset({
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        takeawayPrice: data.takeawayPrice || undefined,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Restaurant Settings
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your restaurant's basic information and settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-gray-600">
                Loading restaurant settings...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Restaurant Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter restaurant name"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Phone Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter phone number"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter restaurant address"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="takeawayPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-800">
                      Takeaway Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter takeaway price (optional)"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                        value={field.value || ''}
                        onChange={e => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : parseFloat(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={form.formState.isSubmitting || isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isLoading}
            >
              {form.formState.isSubmitting ? (
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
