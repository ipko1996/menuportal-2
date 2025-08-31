'use client';

import { useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { Eye, Facebook, Instagram, Save } from 'lucide-react';
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

// --- API HOOKS ---
import {
  useGetScheduleSettings,
  useCreateScheduleSettings,
  useUpdatePlatformScheduleSettings,
  useUpdateCoreScheduleSettings,
  useGetAllSocialAccountsForRestaurant,
} from '@mono-repo/api-client';

// 1. --- TYPE DEFINITIONS & HELPERS ---

interface PlatformSettings {
  id: number | null;
  socialMediaAccountId: number;
  enabled: boolean;
  message: string;
}

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

// 2. --- REUSABLE SUB-COMPONENTS ---

// Component for global scheduling settings
const SchedulingSettings: FC<{
  isEnabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  postTime: string;
  onPostTimeChange: (time: string) => void;
}> = ({ isEnabled, onEnabledChange, postTime, onPostTimeChange }) => (
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
        <Switch
          id="enable-scheduling-switch"
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
    </div>
    {isEnabled && (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <Label className="text-base">Post Time Configuration</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="global-post-time">Post Time</Label>
            <Input
              id="global-post-time"
              type="time"
              value={postTime}
              onChange={e => onPostTimeChange(e.target.value)}
            />
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

// Component for the default message input
const DefaultMessageSettings: FC<{
  message: string;
  onMessageChange: (message: string) => void;
}> = ({ message, onMessageChange }) => (
  <div className="space-y-4">
    <Label className="text-base">Default Message Configuration</Label>
    <p className="text-sm text-muted-foreground">
      Write the standard message that will be used for all platforms unless you
      specify a custom message below.
    </p>
    <div className="space-y-2">
      <Label htmlFor="global-message">Default Message</Label>
      <textarea
        id="global-message"
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder="Write your weekly menu post message..."
        value={message}
        onChange={e => onMessageChange(e.target.value)}
        rows={4}
      />
      <p className="text-sm text-muted-foreground">
        ({message.length}/280 characters)
      </p>
    </div>
  </div>
);

// Reusable card for platform-specific settings
const PlatformSettingsCard: FC<{
  platformName: string;
  icon: ReactNode;
  settings: PlatformSettings;
  onUpdate: (updates: Partial<PlatformSettings>) => void;
  globalMessage: string;
}> = ({ platformName, icon, settings, onUpdate, globalMessage }) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2">
        {icon}
        {platformName} Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-row items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label
            htmlFor={`${platformName}-enabled`}
            className="text-sm font-medium"
          >
            Enable {platformName} Posts
          </Label>
          <p className="text-xs text-muted-foreground">
            Post weekly menu to {platformName}
          </p>
        </div>
        <Switch
          id={`${platformName}-enabled`}
          checked={settings.enabled}
          onCheckedChange={checked => onUpdate({ enabled: checked })}
        />
      </div>
      {settings.enabled && (
        <div className="space-y-2">
          <Label htmlFor={`${platformName}-message`}>
            {platformName} Message
          </Label>
          <textarea
            id={`${platformName}-message`}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={globalMessage}
            value={settings.message}
            onChange={e => onUpdate({ message: e.target.value })}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to use the default message. ({settings.message.length}
            /280 characters)
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

// Component for the preview sidebar
const PostPreview: FC<{
  globalPostTime: string;
  globalMessage: string;
  platforms: Record<string, PlatformSettings>;
}> = ({ globalPostTime, globalMessage, platforms }) => {
  const getEffectiveMessage = (platformMessage: string) =>
    platformMessage || globalMessage;

  const enabledPlatforms = Object.entries(platforms).filter(
    ([, settings]) => settings.enabled
  );

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" /> Post Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabledPlatforms.length > 0 ? (
          enabledPlatforms.map(([name, settings]) => (
            <div key={name} className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                {getPlatformIcon(name)}
                <div>
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    Monday at {globalPostTime}
                  </div>
                </div>
              </div>
              <p className="text-xs mb-2 break-words">
                {getEffectiveMessage(settings.message)}
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

// 3. --- MAIN EXPORTED COMPONENT ---
export function SettingsTab() {
  // --- STATE MANAGEMENT ---
  const [globalEnabled, setGlobalEnabled] = useState<boolean>(false);
  const [globalPostTime, setGlobalPostTime] = useState<string>('09:00');
  const [globalMessage, setGlobalMessage] = useState<string>('');
  const [platforms, setPlatforms] = useState<Record<string, PlatformSettings>>(
    {}
  );

  // --- DATA FETCHING ---
  const { data: socialAccounts, isLoading: isLoadingAccounts } =
    useGetAllSocialAccountsForRestaurant();
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    isError,
  } = useGetScheduleSettings('WEEKLY');

  // --- MUTATIONS ---
  const createSettingsMutation = useCreateScheduleSettings();
  const updateCoreMutation = useUpdateCoreScheduleSettings();
  const updatePlatformMutation = useUpdatePlatformScheduleSettings();

  // Effect to initialize and sync state from fetched data
  useEffect(() => {
    if (isLoadingAccounts || isLoadingSchedule) return;

    const connectedPlatforms: Record<string, PlatformSettings> = {};
    if (socialAccounts) {
      socialAccounts.forEach(account => {
        const platformName =
          account.platform.charAt(0) + account.platform.slice(1).toLowerCase();
        connectedPlatforms[platformName] = {
          id: null,
          socialMediaAccountId: account.id,
          enabled: false,
          message: '',
        };
      });
    }

    if (scheduleData) {
      setGlobalEnabled(scheduleData.isActive);
      setGlobalPostTime(scheduleData.postTime);
      setGlobalMessage(scheduleData.defaultContentText);
      const savedPlatformsMap = new Map(
        scheduleData.platforms.map(p => [p.socialMediaAccountId, p])
      );

      Object.values(connectedPlatforms).forEach(platform => {
        const savedData = savedPlatformsMap.get(platform.socialMediaAccountId);
        if (savedData) {
          platform.id = savedData.id;
          platform.enabled = savedData.isActive;
          platform.message = savedData.contentText ?? '';
        }
      });
    }

    setPlatforms(connectedPlatforms);
  }, [socialAccounts, scheduleData, isLoadingAccounts, isLoadingSchedule]);

  // Dedicated handler for the master toggle switch
  const handleGlobalEnableToggle = (checked: boolean) => {
    setGlobalEnabled(checked);
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

  const updatePlatformSettings = (
    platformName: string,
    updates: Partial<PlatformSettings>
  ) => {
    setPlatforms(prev => ({
      ...prev,
      [platformName]: { ...prev[platformName], ...updates },
    }));
  };

  const isPending =
    createSettingsMutation.isPending ||
    updateCoreMutation.isPending ||
    updatePlatformMutation.isPending;

  const handleSave = async () => {
    if (isError) {
      createSettingsMutation.mutate({
        data: {
          scheduleType: 'WEEKLY',
          postTime: globalPostTime,
          defaultContentText: globalMessage,
          platforms: Object.values(platforms).map(p => ({
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
          isActive: globalEnabled,
          postTime: globalPostTime,
          defaultContentText: globalMessage,
        },
      });
      for (const platform of Object.values(platforms)) {
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
              isEnabled={globalEnabled}
              onEnabledChange={handleGlobalEnableToggle}
              postTime={globalPostTime}
              onPostTimeChange={setGlobalPostTime}
            />
            {globalEnabled && (
              <>
                <DefaultMessageSettings
                  message={globalMessage}
                  onMessageChange={setGlobalMessage}
                />
                <div className="space-y-4">
                  <Label className="text-base">
                    Platform Specific Settings
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Customize settings for each connected platform.
                  </p>
                  {Object.keys(platforms).length > 0 ? (
                    Object.entries(platforms).map(([name, settings]) => (
                      <PlatformSettingsCard
                        key={name}
                        platformName={name}
                        icon={getPlatformIcon(name)}
                        settings={settings}
                        onUpdate={updates =>
                          updatePlatformSettings(name, updates)
                        }
                        globalMessage={globalMessage}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No social media accounts connected.
                    </p>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isPending}>
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
  );
}
