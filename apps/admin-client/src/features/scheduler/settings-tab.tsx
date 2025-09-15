import { useEffect, useMemo } from 'react';
import type { FC, ReactNode } from 'react';
import { Eye, Facebook, Instagram, Save, Loader2 } from 'lucide-react';
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
  getGetScheduleSettingsQueryKey,
} from '@mono-repo/api-client';
import { useQueryClient } from '@tanstack/react-query';

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

const SCHEDULE_TYPE = 'WEEKLY' as const;
const DEFAULT_POST_TIME = '09:00';
const MAX_MESSAGE_LENGTH = 280;

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
}

const SchedulingSettings: FC<SchedulingSettingsProps> = ({
  control,
  isEnabled,
  errors,
}) => (
  <div className="space-y-6">
    <div>
      <Label className="text-base font-semibold">
        Scheduling Configuration
      </Label>
      <p className="text-sm text-muted-foreground mt-1">
        Control when and how your weekly menu gets posted automatically.
      </p>
    </div>

    <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
      <div className="space-y-0.5">
        <Label
          htmlFor="enable-scheduling-switch"
          className="text-base font-medium"
        >
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
            onCheckedChange={field.onChange}
          />
        )}
      />
    </div>

    {isEnabled && (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <Label className="text-base font-medium">Post Time Configuration</Label>
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
              <p className="text-sm text-destructive">
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
  </div>
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
      <div>
        <Label className="text-base font-semibold">
          Default Message Configuration
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Write the standard message that will be used for all platforms unless
          you specify a custom message below.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="global-message">Default Message</Label>
        <Controller
          name="globalMessage"
          control={control}
          render={({ field }) => (
            <textarea
              id="global-message"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Write your weekly menu post message..."
              rows={4}
              {...field}
            />
          )}
        />
        {errors.globalMessage && (
          <p className="text-sm text-destructive">
            {errors.globalMessage.message}
          </p>
        )}
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {globalMessage?.length || 0}/{MAX_MESSAGE_LENGTH} characters
          </p>
          {globalMessage?.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <p className="text-xs text-amber-600">
              Approaching character limit
            </p>
          )}
        </div>
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
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {getPlatformIcon(platform.platformName)}
          <span>{platform.platformName} Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3 bg-card">
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
          <div className="space-y-3 pt-2 border-t">
            <Label htmlFor={`${platform.platformName}-message`}>
              Custom {platform.platformName} Message
            </Label>
            <Controller
              name={`platforms.${index}.message`}
              control={control}
              render={({ field }) => (
                <textarea
                  id={`${platform.platformName}-message`}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={
                    globalMessage || 'Enter custom message for this platform...'
                  }
                  rows={3}
                  {...field}
                />
              )}
            />
            {fieldErrors?.message && (
              <p className="text-sm text-destructive">
                {fieldErrors.message.message}
              </p>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {platform.message
                  ? `${platform.message.length}/${MAX_MESSAGE_LENGTH} characters`
                  : 'Leave blank to use the default message'}
              </p>
              {platform.message &&
                platform.message.length > MAX_MESSAGE_LENGTH * 0.8 && (
                  <p className="text-xs text-amber-600">Approaching limit</p>
                )}
            </div>
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

  if (enabledPlatforms.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Post Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Enable a platform to see its preview
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" /> Post Preview
        </CardTitle>
        <CardDescription>
          Preview how your posts will appear on each platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabledPlatforms.map(platform => (
          <div
            key={platform.socialMediaAccountId}
            className="p-3 border rounded-lg bg-muted/50 transition-all duration-200 hover:bg-muted/70"
          >
            <div className="flex items-center gap-2 mb-3">
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
            <p className="text-xs mb-3 break-words leading-relaxed">
              {getEffectiveMessage(platform.message)}
            </p>
            <div className="w-full h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded text-xs text-center flex items-center justify-center text-muted-foreground font-medium">
              📋 Menu Image
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const LoadingState: FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading settings...</p>
    </div>
  </div>
);

export function SettingsTab() {
  const queryClient = useQueryClient();

  const { data: socialAccounts, isLoading: isLoadingAccounts } =
    useGetAllSocialAccountsForRestaurant();
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isError: isScheduleError,
  } = useGetScheduleSettings(SCHEDULE_TYPE);
  console.log(scheduleData);

  const createSettingsMutation = useCreateScheduleSettings();
  const updateCoreMutation = useUpdateCoreScheduleSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetScheduleSettingsQueryKey(SCHEDULE_TYPE),
        });
      },
    },
  });
  const updatePlatformMutation = useUpdatePlatformScheduleSettings({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: getGetScheduleSettingsQueryKey(SCHEDULE_TYPE),
        });
      },
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      globalEnabled: false,
      globalPostTime: DEFAULT_POST_TIME,
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
    reset,
  } = form;

  const { fields } = useFieldArray({ control, name: 'platforms' });
  const watchedValues = watch();
  const { globalEnabled, globalPostTime, globalMessage, platforms } =
    watchedValues;

  const hasExistingSettings = Boolean(scheduleData && !isScheduleError);
  const isLoading = isLoadingAccounts || isLoadingSchedule;
  const isPending =
    createSettingsMutation.isPending ||
    updateCoreMutation.isPending ||
    updatePlatformMutation.isPending;

  const connectedPlatforms = useMemo(() => {
    if (!socialAccounts?.length) return [];

    return socialAccounts.map(account => ({
      id: null,
      socialMediaAccountId: account.id,
      enabled: false,
      message: '',
      platformName: normalizePlatformName(account.platform),
    }));
  }, [socialAccounts]);

  useEffect(() => {
    if (isLoading || !socialAccounts?.length) return;

    const platformsWithDefaults = connectedPlatforms.map(platform => ({
      ...platform,
      enabled: false,
      message: '',
    }));

    if (hasExistingSettings) {
      const savedPlatformsMap = new Map(
        scheduleData?.platforms.map(p => [p.socialMediaAccountId, p])
      );

      const updatedPlatforms = platformsWithDefaults.map(platform => {
        const savedData = savedPlatformsMap.get(platform.socialMediaAccountId);
        if (savedData) {
          return {
            ...platform,
            id: savedData.id,
            enabled: savedData.isActive,
            message: savedData.contentText || '',
          };
        }
        return platform;
      });

      reset({
        globalEnabled: scheduleData?.isActive,
        globalPostTime: scheduleData?.postTime,
        globalMessage: scheduleData?.defaultContentText,
        platforms: updatedPlatforms,
      });
    } else {
      reset({
        globalEnabled: false,
        globalPostTime: DEFAULT_POST_TIME,
        globalMessage: '',
        platforms: platformsWithDefaults,
      });
    }
  }, [
    socialAccounts,
    scheduleData,
    hasExistingSettings,
    isLoading,
    connectedPlatforms,
    reset,
  ]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!hasExistingSettings) {
        await createSettingsMutation.mutateAsync({
          data: {
            scheduleType: SCHEDULE_TYPE,
            postTime: data.globalPostTime,
            defaultContentText: data.globalMessage,
            platforms: data.platforms.map(p => {
              return {
                socialMediaAccountId: p.socialMediaAccountId,
                isActive: p.enabled,
                contentText: p.message,
              };
            }),
          },
        });
        console.log('Settings created successfully!');
      } else {
        await updateCoreMutation.mutateAsync({
          scheduleType: SCHEDULE_TYPE,
          data: {
            isActive: data.globalEnabled,
            postTime: data.globalPostTime,
            defaultContentText: data.globalMessage,
          },
        });

        const updatePromises = data.platforms
          .filter(platform => platform.id)
          .map(platform =>
            updatePlatformMutation.mutateAsync({
              platformScheduleId: platform.id!,
              data: {
                isActive: platform.enabled,
                contentText: platform.message || null,
              },
            })
          );

        await Promise.all(updatePromises);
        console.log('Settings updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!socialAccounts?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu Scheduling</CardTitle>
          <CardDescription>
            Connect your social media accounts to start scheduling weekly menu
            posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Facebook className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No social media accounts connected</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Connect your Facebook, Instagram, or other social media accounts
              to enable automated weekly menu posting.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu Scheduling</CardTitle>
              <CardDescription>
                {hasExistingSettings
                  ? 'Manage your weekly menu scheduling settings.'
                  : 'Set up automatic weekly menu posting for your social media accounts.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <SchedulingSettings
                control={control}
                isEnabled={globalEnabled}
                errors={errors}
              />

              {globalEnabled && (
                <>
                  <DefaultMessageSettings
                    control={control}
                    watch={watch}
                    errors={errors}
                  />

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">
                        Platform Settings
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize settings for each connected platform.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <PlatformSettingsCard
                          key={field.id}
                          index={index}
                          platform={platforms[index]}
                          control={control}
                          globalMessage={globalMessage}
                          errors={errors}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {hasExistingSettings
                        ? 'Update Settings'
                        : 'Create Schedule'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
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
