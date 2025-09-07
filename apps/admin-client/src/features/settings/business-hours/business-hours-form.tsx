import React, { useEffect, useMemo } from 'react';
import { Button } from '@mono-repo/ui/button';
import { Switch } from '@mono-repo/ui/switch';
import { Input } from '@mono-repo/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mono-repo/ui/form';
import { Clock, Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useFindAllBusinessHours,
  useCreateBulkBusinessHours,
  useUpdateBusinessHour,
  useDeleteBusinessHour,
  getFindAllBusinessHoursQueryKey,
  type CreateBusinessHourDto,
} from '@mono-repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

const timeToMinutes = (time: string) => {
  if (!time) return Infinity;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const businessHourSchema = z
  .object({
    id: z.number().optional(),
    dayOfWeek: z.enum([
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ]),
    openingTime: z.string(),
    closingTime: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isActive) {
      if (!data.openingTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Required',
          path: ['openingTime'],
        });
      }
      if (!data.closingTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Required',
          path: ['closingTime'],
        });
      }
    }
  })
  .refine(
    data => {
      if (!data.isActive || !data.openingTime || !data.closingTime) {
        return true;
      }
      return timeToMinutes(data.openingTime) < timeToMinutes(data.closingTime);
    },
    {
      message: 'Must be after opening',
      path: ['closingTime'],
    }
  );

const formSchema = z.object({
  businessHours: z.array(businessHourSchema),
});

type BusinessHoursFormValues = z.infer<typeof formSchema>;

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export function BusinessHoursForm() {
  const queryClient = useQueryClient();
  const { data: serverBusinessHours, isLoading } = useFindAllBusinessHours();
  const { mutateAsync: createBulkBusinessHours } = useCreateBulkBusinessHours();
  const { mutateAsync: updateBusinessHour } = useUpdateBusinessHour();
  const { mutateAsync: deleteBusinessHour } = useDeleteBusinessHour();
  const defaultValues = useMemo(
    () => ({
      businessHours: DAYS_OF_WEEK.map(day => ({
        dayOfWeek: day,
        openingTime: '08:00',
        closingTime: '17:00',
        isActive: false,
        id: undefined,
      })),
    }),
    []
  );
  const form = useForm<BusinessHoursFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: 'businessHours',
  });
  useEffect(() => {
    if (serverBusinessHours) {
      const formData = DAYS_OF_WEEK.map(day => {
        const serverData = serverBusinessHours.find(bh => bh.dayOfWeek === day);
        return serverData
          ? {
              id: serverData.id,
              dayOfWeek: serverData.dayOfWeek,
              openingTime: serverData.openingTime,
              closingTime: serverData.closingTime,
              isActive: true,
            }
          : {
              dayOfWeek: day,
              openingTime: '08:00',
              closingTime: '17:00',
              isActive: false,
            };
      });
      form.reset({ businessHours: formData });
    }
  }, [serverBusinessHours, form]);
  const onSubmit = async (data: BusinessHoursFormValues) => {
    const originalDataMap = new Map(
      serverBusinessHours?.map(bh => [bh.dayOfWeek, bh])
    );
    const promises: Promise<any>[] = [];
    const toCreate: CreateBusinessHourDto[] = [];
    data.businessHours.forEach(formDay => {
      const originalDay = originalDataMap.get(formDay.dayOfWeek);
      if (formDay.isActive && !originalDay) {
        toCreate.push({
          dayOfWeek: formDay.dayOfWeek,
          openingTime: formDay.openingTime,
          closingTime: formDay.closingTime,
        });
      } else if (!formDay.isActive && originalDay) {
        promises.push(deleteBusinessHour({ id: originalDay.id }));
      } else if (formDay.isActive && originalDay) {
        const dataToUpdate: Partial<CreateBusinessHourDto> = {};
        if (formDay.openingTime !== originalDay.openingTime) {
          dataToUpdate.openingTime = formDay.openingTime;
        }
        if (formDay.closingTime !== originalDay.closingTime) {
          dataToUpdate.closingTime = formDay.closingTime;
        }
        if (Object.keys(dataToUpdate).length > 0) {
          promises.push(
            updateBusinessHour({ id: originalDay.id, data: dataToUpdate })
          );
        }
      }
    });
    if (toCreate.length > 0) {
      promises.push(
        createBulkBusinessHours({ data: { businessHours: toCreate } })
      );
    }
    if (promises.length === 0) {
      toast.info('No changes to save.');
      return;
    }
    try {
      await Promise.all(promises);
      toast.success('Business hours saved successfully!');
      queryClient.invalidateQueries({
        queryKey: getFindAllBusinessHoursQueryKey(),
      });
    } catch (error) {
      toast.error('Failed to save business hours. Please try again.');
      console.error('Error saving business hours:', error);
    }
  };
  const capitalize = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border p-4">
            {fields.map((field, index) => {
              const isActive = form.watch(`businessHours.${index}.isActive`);

              return (
                <div
                  key={field.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-24 font-medium text-gray-800">
                      {capitalize(field.dayOfWeek)}
                    </span>
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.isActive`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel
                            className={`transition-colors text-sm ${
                              field.value ? 'text-black' : 'text-gray-500'
                            }`}
                          >
                            {field.value ? 'Open' : 'Closed'}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div
                    className={`flex items-start gap-2 transition-opacity ${
                      !isActive ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.openingTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="time"
                              className="w-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <span className="pt-2 text-gray-500">-</span>
                    <FormField
                      control={form.control}
                      name={`businessHours.${index}.closingTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="time"
                              className="w-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
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
  );
}
