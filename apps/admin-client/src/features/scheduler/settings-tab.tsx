import { useEffect, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { Eye, Facebook, Instagram, Save } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  Label,
  CardContent,
  CardTitle,
  CardDescription,
  Input,
  Switch,
  Button,
} from '@mono-repo/ui';

import {
  useGetScheduleSettings,
  useCreateScheduleSettings,
  useUpdatePlatformScheduleSettings,
  useUpdateCoreScheduleSettings,
  useGetAllSocialAccountsForRestaurant,
} from '@mono-repo/api-client';

const platformSettingsSchema = z.object({
  id: z.number().nullable(),
  socialMediaAccountId: z.number(),
  enabled: z.boolean(),
  message: z.string().max(280, 'Message must be 280 characters or less'),
  platformName: z.string(),
});

const formSchema = z.object({
  globalEnabled: z.boolean(),
  globalPostTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  globalMessage: z
    .string()
    .min(1, 'Default message is required')
    .max(280, 'Message must be 280 characters or less'),
  platforms: z.array(platformSettingsSchema),
});

type FormData = z.infer<typeof formSchema>;
type PlatformSettings = z.infer<typeof platformSettingsSchema>;

const getPlatformIcon = (platformName: string): ReactNode => {
  const lowerCaseName = platformName.toLowerCase();
  if (lowerCaseName.includes('facebook')) {
    return <Facebook className="h-5 w-5 text-blue-600" />;
  }
  if (lowerCaseName.includes('instagram')) {
    return <Instagram className="h-5 w-5 text-pink-600" />;
  }
  return null;
};

const normalizePlatformName = (platform: string): string =>
  platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();

interface SchedulingSettingsProps {
  control: any;
  isEnabled: boolean;
  errors: any;
  onEnabledChange: (checked: boolean) => void;
}

const SchedulingSettings: FC<SchedulingSettingsProps> = ({
  control,
  isEnabled,
  errors,
  onEnabledChange,
}) => (
  <>
    <div className="space-y-4">
      <Label className="text-base">Scheduling Type</Label>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="enable-scheduling-switch" className="text-base">
            Enable Weekly Scheduling
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically post your weekly menu across all connected platforms
          </p>
        </div>
        <Controller
          name="globalEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              id="enable-scheduling-switch"
              checked={field.value}
              onCheckedChange={checked => {
                field.onChange(checked);
                onEnabledChange(checked);
              }}
            />
          )}
        />
      </div>
    </div>
    {isEnabled && (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <Label className="text-base">Post Time Configuration</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="global-post-time">Post Time</Label>
            <Controller
              name="globalPostTime"
              control={control}
              render={({ field }) => (
                <Input id="global-post-time" type="time" {...field} />
              )}
            />
            {errors.globalPostTime && (
              <p className="text-sm text-red-500">
                {errors.globalPostTime.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Post Day</Label>
            <div className="flex items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm">
              <span>Monday (Planned Week)</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Fixed
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);

interface DefaultMessageSettingsProps {
  control: any;
  watch: any;
  errors: any;
}

const DefaultMessageSettings: FC<DefaultMessageSettingsProps> = ({
  control,
  watch,
  errors,
}) => {
  const globalMessage = watch('globalMessage');

  return (
    <div className="space-y-4">
      <Label className="text-base">Default Message Configuration</Label>
      <p className="text-sm text-muted-foreground">
        Write the standard message that will be used for all platforms unless
        you specify a custom message below.
      </p>
      <div className="space-y-2">
        <Label htmlFor="global-message">Default Message</Label>
        <Controller
          name="globalMessage"
          control={control}
          render={({ field }) => (
            <textarea
              id="global-message"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your weekly menu post message..."
              rows={4}
              {...field}
            />
          )}
        />
        {errors.globalMessage && (
          <p className="text-sm text-red-500">{errors.globalMessage.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          ({globalMessage?.length || 0}/280 characters)
        </p>
      </div>
    </div>
  );
};

interface PlatformSettingsCardProps {
  index: number;
  platform: PlatformSettings;
  control: any;
  globalMessage: string;
  errors: any;
}

const PlatformSettingsCard: FC<PlatformSettingsCardProps> = ({
  index,
  platform,
  control,
  globalMessage,
  errors,
}) => {
  const fieldErrors = errors.platforms?.[index];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getPlatformIcon(platform.platformName)}
          {platform.platformName} Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label
              htmlFor={`${platform.platformName}-enabled`}
              className="text-sm font-medium"
            >
              Enable {platform.platformName} Posts
            </Label>
            <p className="text-xs text-muted-foreground">
              Post weekly menu to {platform.platformName}
            </p>
          </div>
          <Controller
            name={`platforms.${index}.enabled`}
            control={control}
            render={({ field }) => (
              <Switch
                id={`${platform.platformName}-enabled`}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        {platform.enabled && (
          <div className="space-y-2">
            <Label htmlFor={`${platform.platformName}-message`}>
              {platform.platformName} Message
            </Label>
            <Controller
              name={`platforms.${index}.message`}
              control={control}
              render={({ field }) => (
                <textarea
                  id={`${platform.platformName}-message`}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={globalMessage}
                  rows={3}
                  {...field}
                />
              )}
            />
            {fieldErrors?.message && (
              <p className="text-sm text-red-500">
                {fieldErrors.message.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave blank to use the default message. (
              {platform.message?.length || 0}/280 characters)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PostPreviewProps {
  globalPostTime: string;
  globalMessage: string;
  platforms: PlatformSettings[];
}

const PostPreview: FC<PostPreviewProps> = ({
  globalPostTime,
  globalMessage,
  platforms,
}) => {
  const enabledPlatforms = platforms.filter(platform => platform.enabled);

  const getEffectiveMessage = (platformMessage: string) =>
    platformMessage || globalMessage;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" /> Post Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabledPlatforms.length > 0 ? (
          enabledPlatforms.map(platform => (
            <div
              key={platform.socialMediaAccountId}
              className="p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-2">
                {getPlatformIcon(platform.platformName)}
                <div>
                  <div className="text-sm font-semibold">
                    {platform.platformName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Monday at {globalPostTime}
                  </div>
                </div>
              </div>
              <p className="text-xs mb-2 break-words">
                {getEffectiveMessage(platform.message)}
              </p>
              <div className="w-full h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded text-xs text-center flex items-center justify-center text-muted-foreground">
                Menu Image
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">
            Enable a platform to see its preview.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export function SettingsTab() {
  const { data: socialAccounts, isLoading: isLoadingAccounts } =
    useGetAllSocialAccountsForRestaurant();
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isError,
  } = useGetScheduleSettings('WEEKLY');

  const createSettingsMutation = useCreateScheduleSettings();
  const updateCoreMutation = useUpdateCoreScheduleSettings();
  const updatePlatformMutation = useUpdatePlatformScheduleSettings();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      globalEnabled: false,
      globalPostTime: '09:00',
      globalMessage: '',
      platforms: [],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const { fields } = useFieldArray({ control, name: 'platforms' });

  const watchedValues = watch();
  const { globalEnabled, globalPostTime, globalMessage, platforms } =
    watchedValues;

  const connectedPlatforms = useMemo(() => {
    if (!socialAccounts) return [];

    return socialAccounts.map(account => ({
      id: null,
      socialMediaAccountId: account.id,
      enabled: false,
      message: '',
      platformName: normalizePlatformName(account.platform),
    }));
  }, [socialAccounts]);

  useEffect(() => {
    if (isLoadingAccounts || isLoadingSchedule || !socialAccounts) return;

    const platformsWithDefaults = connectedPlatforms.map(platform => ({
      ...platform,
      enabled: false,
      message: '',
    }));

    if (scheduleData) {
      setValue('globalEnabled', scheduleData.isActive);
      setValue('globalPostTime', scheduleData.postTime);
      setValue('globalMessage', scheduleData.defaultContentText);

      const savedPlatformsMap = new Map(
        scheduleData.platforms.map(p => [p.socialMediaAccountId, p])
      );

      const updatedPlatforms = platformsWithDefaults.map(platform => {
        const savedData = savedPlatformsMap.get(platform.socialMediaAccountId);
        if (savedData) {
          return {
            ...platform,
            id: savedData.id,
            enabled: savedData.isActive,
            message: savedData.contentText ?? '',
          };
        }
        return platform;
      });

      setValue('platforms', updatedPlatforms);
    } else {
      setValue('platforms', platformsWithDefaults);
    }
  }, [
    socialAccounts,
    scheduleData,
    isLoadingAccounts,
    isLoadingSchedule,
    connectedPlatforms,
    setValue,
  ]);

  const handleGlobalEnableToggle = (checked: boolean) => {
    if (scheduleData) {
      updateCoreMutation.mutate({
        scheduleType: 'WEEKLY',
        data: {
          isActive: checked,
          postTime: globalPostTime,
          defaultContentText: globalMessage,
        },
      });
    }
  };

  const isPending =
    createSettingsMutation.isPending ||
    updateCoreMutation.isPending ||
    updatePlatformMutation.isPending;

  const onSubmit = async (data: FormData) => {
    if (isError) {
      createSettingsMutation.mutate({
        data: {
          scheduleType: 'WEEKLY',
          postTime: data.globalPostTime,
          defaultContentText: data.globalMessage,
          platforms: data.platforms.map(p => ({
            socialMediaAccountId: p.socialMediaAccountId,
            isActive: p.enabled,
            contentText: p.message || undefined,
          })),
        },
      });
      return;
    }

    try {
      await updateCoreMutation.mutateAsync({
        scheduleType: 'WEEKLY',
        data: {
          isActive: data.globalEnabled,
          postTime: data.globalPostTime,
          defaultContentText: data.globalMessage,
        },
      });

      for (const platform of data.platforms) {
        if (platform.id) {
          await updatePlatformMutation.mutateAsync({
            platformScheduleId: platform.id,
            data: {
              isActive: platform.enabled,
              contentText: platform.message || null,
            },
          });
        }
      }
      console.log('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings.', error);
    }
  };

  if (isLoadingAccounts || isLoadingSchedule) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu Scheduling</CardTitle>
              <CardDescription>
                {isError
                  ? 'Setup your new weekly schedule.'
                  : 'Configure when and how your menu gets posted automatically.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SchedulingSettings
                control={control}
                isEnabled={globalEnabled}
                errors={errors}
                onEnabledChange={handleGlobalEnableToggle}
              />
              {globalEnabled && (
                <>
                  <DefaultMessageSettings
                    control={control}
                    watch={watch}
                    errors={errors}
                  />
                  <div className="space-y-4">
                    <Label className="text-base">
                      Platform Specific Settings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Customize settings for each connected platform.
                    </p>
                    {fields.length > 0 ? (
                      fields.map((field, index) => (
                        <PlatformSettingsCard
                          key={field.id}
                          index={index}
                          platform={platforms[index]}
                          control={control}
                          globalMessage={globalMessage}
                          errors={errors}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No social media accounts connected.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          {globalEnabled && (
            <PostPreview
              globalPostTime={globalPostTime}
              globalMessage={globalMessage}
              platforms={platforms}
            />
          )}
        </div>
      </div>
    </form>
  );
}
