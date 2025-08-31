import { useState, useEffect } from 'react';
import { Eye, Facebook, Instagram, Save, Settings, Globe } from 'lucide-react';
import { toast } from 'sonner';
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from '@mono-repo/ui';
import {
  useUpdateScheduleSettings,
  useGetScheduleSettings,
  useCreateScheduleSettings,
  useGetAllSocialAccountsForRestaurant,
  SocialDto,
  ScheduleSettingsDto,
  UpdateScheduleSettingsDto,
  PlatformSettingsDto,
} from '@mono-repo/api-client';

// --- Schema and Types ---
const settingsSchema = z.object({
  enabled: z.boolean(),
  postTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(280, 'Message must be 280 characters or less'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface PlatformSettings {
  enabled: boolean;
  message: string;
  useGlobalSettings: boolean;
  socialMediaAccountId?: number; // Added to store the ID
}

// --- Component Implementation ---
export function SettingsTab() {
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialDto[]>([]);

  // Global settings state
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [globalPostTime, setGlobalPostTime] = useState('09:00');
  const [globalMessage, setGlobalMessage] = useState(
    "Next week's menu is ready! Plan your weekly meals with us! 🍽️"
  );

  // Platform-specific settings state
  const [facebookSettings, setFacebookSettings] = useState<PlatformSettings>({
    enabled: true,
    message: "Check out next week's delicious menu! 🍽️ #WeeklyMenu",
    useGlobalSettings: true,
  });

  const [instagramSettings, setInstagramSettings] = useState<PlatformSettings>({
    enabled: true,
    message: 'Fresh weekly menu is here! 📸✨ #FoodLover #WeeklyMenu',
    useGlobalSettings: true,
  });

  const [settingsMode, setSettingsMode] = useState<'global' | 'individual'>(
    'global'
  );

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<string, string>>
  >({});

  // --- API Hooks ---
  const { data: accountsData, isLoading: isLoadingAccounts } =
    useGetAllSocialAccountsForRestaurant();

  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetScheduleSettings('WEEKLY', {
      query: { enabled: !!accountsData },
    });

  const { mutate: createSettings, isPending: isCreating } =
    useCreateScheduleSettings({
      mutation: {
        onSuccess: () => {
          toast.success('Scheduling settings created successfully.');
          setValidationErrors({});
        },
        onError: error => {
          toast.error('Failed to create settings', {
            description:
              error.response?.data?.message || 'An unexpected error occurred.',
          });
        },
      },
    });

  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateScheduleSettings({
      mutation: {
        onSuccess: () => {
          toast.success('Scheduling settings updated successfully.');
          setValidationErrors({});
        },
        onError: error => {
          toast.error('Failed to update settings', {
            description:
              error.response?.data?.message || 'An unexpected error occurred.',
          });
        },
      },
    });

  const isPending = isCreating || isUpdating;

  // --- Effect to Populate State from Fetched Data ---
  useEffect(() => {
    if (accountsData) {
      setSocialAccounts(accountsData);
      const facebookAccount = accountsData.find(
        acc => acc.platform === 'FACEBOOK'
      );
      const instagramAccount = accountsData.find(
        acc => acc.platform === 'INSTAGRAM'
      );

      if (facebookAccount) {
        updateFacebookSettings({
          socialMediaAccountId: facebookAccount.id,
          enabled: facebookAccount.isActive,
        });
      }
      if (instagramAccount) {
        updateInstagramSettings({
          socialMediaAccountId: instagramAccount.id,
          enabled: instagramAccount.isActive,
        });
      }
    }

    if (settingsData) {
      setSettingsId(settingsData.id);
      setGlobalEnabled(settingsData.isActive);
      setGlobalPostTime(settingsData.postTime);
      setGlobalMessage(settingsData.defaultContentText);

      const fbPlatformSettings = settingsData.platforms.find(
        p => p.socialMediaAccountId === facebookSettings.socialMediaAccountId
      );
      const igPlatformSettings = settingsData.platforms.find(
        p => p.socialMediaAccountId === instagramSettings.socialMediaAccountId
      );

      let isIndividualMode = false;

      if (fbPlatformSettings) {
        updateFacebookSettings({
          enabled: fbPlatformSettings.isActive,
          useGlobalSettings: !fbPlatformSettings.contentText,
          message: fbPlatformSettings.contentText || facebookSettings.message,
        });
        if (fbPlatformSettings.contentText) isIndividualMode = true;
      }

      if (igPlatformSettings) {
        updateInstagramSettings({
          enabled: igPlatformSettings.isActive,
          useGlobalSettings: !igPlatformSettings.contentText,
          message: igPlatformSettings.contentText || instagramSettings.message,
        });
        if (igPlatformSettings.contentText) isIndividualMode = true;
      }

      // Heuristic to set the UI mode based on loaded data
      setSettingsMode(isIndividualMode ? 'individual' : 'global');
    }
  }, [
    accountsData,
    settingsData,
    facebookSettings.socialMediaAccountId,
    instagramSettings.socialMediaAccountId,
  ]);

  // --- Validation Logic ---
  const validateGlobalForm = (): boolean => {
    const formData: SettingsFormData = {
      enabled: globalEnabled,
      postTime: globalPostTime,
      message: globalMessage,
    };

    const result = settingsSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<string, string>> = {};
      result.error.issues.forEach(error => {
        const field = `global_${error.path[0]}`;
        errors[field] = error.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const validatePlatformSettings = (
    platform: 'facebook' | 'instagram'
  ): boolean => {
    const settings =
      platform === 'facebook' ? facebookSettings : instagramSettings;

    if (settings.useGlobalSettings) return true;

    const formData = {
      enabled: settings.enabled,
      postTime: globalPostTime, // Always use global time
      message: settings.message,
    };

    const result = settingsSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<string, string>> = {};
      result.error.issues.forEach(error => {
        const field = `${platform}_${error.path[0]}`;
        errors[field] = error.message;
      });
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  // --- Save Handler ---
  const handleSave = () => {
    if (isPending) return;

    let isValid = true;
    if (settingsMode === 'global') {
      isValid = validateGlobalForm();
    } else {
      isValid =
        validatePlatformSettings('facebook') &&
        validatePlatformSettings('instagram');
    }

    if (!isValid) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    // --- DTO Transformation Logic ---
    const platformSettings: PlatformSettingsDto[] = [];
    if (facebookSettings.socialMediaAccountId) {
      platformSettings.push({
        socialMediaAccountId: facebookSettings.socialMediaAccountId,
        isActive: facebookSettings.enabled,
        contentText:
          settingsMode === 'individual' && !facebookSettings.useGlobalSettings
            ? facebookSettings.message
            : null,
      });
    }
    if (instagramSettings.socialMediaAccountId) {
      platformSettings.push({
        socialMediaAccountId: instagramSettings.socialMediaAccountId,
        isActive: instagramSettings.enabled,
        contentText:
          settingsMode === 'individual' && !instagramSettings.useGlobalSettings
            ? instagramSettings.message
            : null,
      });
    }

    const payload: UpdateScheduleSettingsDto = {
      scheduleType: 'WEEKLY',
      postTime: globalPostTime,
      defaultContentText: globalMessage,
      isActive: globalEnabled,
      platforms: platformSettings,
    };

    if (settingsId) {
      // We have existing settings, so UPDATE them.
      updateSettings({ data: payload });
    } else {
      // No settings exist, so CREATE them.
      createSettings({
        data: {
          ...payload,
        },
      });
    }
  };

  // --- Helper Functions ---
  const updateFacebookSettings = (updates: Partial<PlatformSettings>) => {
    setFacebookSettings(prev => ({ ...prev, ...updates }));
  };

  const updateInstagramSettings = (updates: Partial<PlatformSettings>) => {
    setInstagramSettings(prev => ({ ...prev, ...updates }));
  };

  const getEffectiveSettings = (platform: 'facebook' | 'instagram') => {
    const platformSettings =
      platform === 'facebook' ? facebookSettings : instagramSettings;

    if (platformSettings.useGlobalSettings || settingsMode === 'global') {
      return {
        enabled: globalEnabled,
        postTime: globalPostTime,
        message: globalMessage,
      };
    }

    return {
      enabled: platformSettings.enabled,
      postTime: globalPostTime, // Always use global time
      message: platformSettings.message,
    };
  };

  if (isLoadingAccounts || isLoadingSettings) {
    return <div>Loading settings...</div>;
  }

  // --- JSX ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Menu Scheduling</CardTitle>
            <CardDescription>
              Configure when and how your menu gets posted automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Scheduling Type</Label>
              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="weekly" className="flex-1">
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger value="daily" disabled className="flex-1">
                    Daily (Coming Soon)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Weekly Scheduling</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically post your weekly menu across all connected
                  platforms
                </p>
              </div>
              <Switch
                checked={globalEnabled}
                onCheckedChange={setGlobalEnabled}
              />
            </div>

            {globalEnabled && (
              <>
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <Label className="text-base">Post Time Configuration</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly menus are automatically scheduled for Monday at the
                    time specified below. This time applies to all platforms.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="global-post-time">Post Time</Label>
                      <Input
                        id="global-post-time"
                        type="time"
                        value={globalPostTime}
                        onChange={e => setGlobalPostTime(e.target.value)}
                        className={
                          validationErrors.global_postTime
                            ? 'border-destructive'
                            : ''
                        }
                      />
                      {validationErrors.global_postTime && (
                        <p className="text-sm text-destructive">
                          {validationErrors.global_postTime}
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

                <div className="space-y-4">
                  <Label className="text-base">Message Configuration</Label>
                  <Tabs
                    value={settingsMode}
                    onValueChange={value =>
                      setSettingsMode(value as 'global' | 'individual')
                    }
                    className="w-full"
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="global" className="flex-1">
                        <Globe className="h-4 w-4 mr-2" />
                        Global Message
                      </TabsTrigger>
                      <TabsTrigger value="individual" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Platform Specific
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="global" className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="global-message">Post Message</Label>
                        <textarea
                          id="global-message"
                          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            validationErrors.global_message
                              ? 'border-destructive'
                              : ''
                          }`}
                          placeholder="Write your weekly menu post message..."
                          value={globalMessage}
                          onChange={e => setGlobalMessage(e.target.value)}
                          rows={4}
                        />
                        {validationErrors.global_message && (
                          <p className="text-sm text-destructive">
                            {validationErrors.global_message}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          This message will appear with your weekly menu post
                          across all platforms ({globalMessage.length}/280
                          characters)
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="individual" className="space-y-6 mt-6">
                      <div className="space-y-6">
                        {/* Facebook Settings */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Facebook className="h-5 w-5 text-blue-600" />
                              Facebook Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">
                                  Enable Facebook Posts
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Post weekly menu to Facebook
                                </p>
                              </div>
                              <Switch
                                checked={facebookSettings.enabled}
                                onCheckedChange={checked =>
                                  updateFacebookSettings({ enabled: checked })
                                }
                              />
                            </div>

                            {facebookSettings.enabled && (
                              <>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                      Use Global Message
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      Use the same message as global settings
                                    </p>
                                  </div>
                                  <Switch
                                    checked={facebookSettings.useGlobalSettings}
                                    onCheckedChange={checked =>
                                      updateFacebookSettings({
                                        useGlobalSettings: checked,
                                      })
                                    }
                                  />
                                </div>

                                {!facebookSettings.useGlobalSettings && (
                                  <div className="space-y-2">
                                    <Label htmlFor="facebook-message">
                                      Facebook Message
                                    </Label>
                                    <textarea
                                      id="facebook-message"
                                      className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        validationErrors.facebook_message
                                          ? 'border-destructive'
                                          : ''
                                      }`}
                                      placeholder="Custom Facebook message..."
                                      value={facebookSettings.message}
                                      onChange={e =>
                                        updateFacebookSettings({
                                          message: e.target.value,
                                        })
                                      }
                                      rows={3}
                                    />
                                    {validationErrors.facebook_message && (
                                      <p className="text-sm text-destructive">
                                        {validationErrors.facebook_message}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                      ({facebookSettings.message.length}/280
                                      characters)
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Instagram Settings */}
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                              <Instagram className="h-5 w-5 text-pink-600" />
                              Instagram Settings
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-medium">
                                  Enable Instagram Posts
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Post weekly menu to Instagram
                                </p>
                              </div>
                              <Switch
                                checked={instagramSettings.enabled}
                                onCheckedChange={checked =>
                                  updateInstagramSettings({ enabled: checked })
                                }
                              />
                            </div>

                            {instagramSettings.enabled && (
                              <>
                                <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                                  <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                      Use Global Message
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      Use the same message as global settings
                                    </p>
                                  </div>
                                  <Switch
                                    checked={
                                      instagramSettings.useGlobalSettings
                                    }
                                    onCheckedChange={checked =>
                                      updateInstagramSettings({
                                        useGlobalSettings: checked,
                                      })
                                    }
                                  />
                                </div>

                                {!instagramSettings.useGlobalSettings && (
                                  <div className="space-y-2">
                                    <Label htmlFor="instagram-message">
                                      Instagram Message
                                    </Label>
                                    <textarea
                                      id="instagram-message"
                                      className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        validationErrors.instagram_message
                                          ? 'border-destructive'
                                          : ''
                                      }`}
                                      placeholder="Custom Instagram message with hashtags..."
                                      value={instagramSettings.message}
                                      onChange={e =>
                                        updateInstagramSettings({
                                          message: e.target.value,
                                        })
                                      }
                                      rows={3}
                                    />
                                    {validationErrors.instagram_message && (
                                      <p className="text-sm text-destructive">
                                        {validationErrors.instagram_message}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                      ({instagramSettings.message.length}/280
                                      characters)
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Settings
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
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Post Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settingsMode === 'global' ? (
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold">Your Restaurant</div>
                    <div className="text-xs text-muted-foreground">
                      Monday at {globalPostTime} (All Platforms)
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-2">{globalMessage}</p>

                <div className="w-full h-24 bg-gradient-to-r from-orange-200 to-red-200 rounded-md flex items-center justify-center text-xs text-muted-foreground mb-3">
                  Weekly Menu Image
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <Instagram className="h-4 w-4 text-pink-600" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Facebook Preview */}
                {facebookSettings.enabled && (
                  <div className="p-3 border rounded-lg bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="text-sm font-semibold">Facebook</div>
                        <div className="text-xs text-muted-foreground">
                          Monday at {getEffectiveSettings('facebook').postTime}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs mb-2">
                      {getEffectiveSettings('facebook').message}
                    </p>

                    <div className="w-full h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded text-xs text-center flex items-center justify-center text-muted-foreground">
                      Menu Image
                    </div>
                  </div>
                )}

                {/* Instagram Preview */}
                {instagramSettings.enabled && (
                  <div className="p-3 border rounded-lg bg-pink-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      <div>
                        <div className="text-sm font-semibold">Instagram</div>
                        <div className="text-xs text-muted-foreground">
                          Monday at {getEffectiveSettings('instagram').postTime}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs mb-2">
                      {getEffectiveSettings('instagram').message}
                    </p>

                    <div className="w-full h-16 bg-gradient-to-r from-orange-200 to-red-200 rounded text-xs text-center flex items-center justify-center text-muted-foreground">
                      Menu Image
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
