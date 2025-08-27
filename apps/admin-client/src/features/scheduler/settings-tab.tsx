'use client';

import { useEffect, useState } from 'react';
import { Eye, Facebook, Instagram, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  Label,
  Skeleton,
  CardContent,
  CardTitle,
  CardDescription,
  Input,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  Button,
} from '@mono-repo/ui';
import {
  useGetScheduleSettings,
  useUpdateScheduleSettings,
} from '@mono-repo/api-client';
import SettingsLoadingSkeleton from './components/settings-tab-skeleton';

const settingsSchema = z.object({
  enabled: z.boolean(),
  postDay: z.enum(['SATURDAY', 'SUNDAY', 'MONDAY']),
  postTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(280, 'Message must be 280 characters or less'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsTab() {
  const [enabled, setEnabled] = useState(true);
  const [postTime, setPostTime] = useState('18:00');
  const [selectedDay, setSelectedDay] = useState<
    'SATURDAY' | 'SUNDAY' | 'MONDAY'
  >('MONDAY');
  const [message, setMessage] = useState(
    "Next week's menu is ready! Plan your weekly meals with us! 🍽️"
  );

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof SettingsFormData, string>>
  >({});

  const { data: settingsData, isLoading: isLoadingSettings } =
    useGetScheduleSettings({
      query: {
        staleTime: 5 * 60 * 1000,
        select: data => data,
      },
    });

  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateScheduleSettings({
      mutation: {
        onSuccess: () => {
          toast.success(
            'Your weekly scheduling settings have been updated successfully.'
          );
          setValidationErrors({});
        },
        onError: error => {
          toast.error('Failed to save settings', {
            description:
              error.response?.data?.message || 'An unexpected error occurred.',
          });
        },
      },
    });

  useEffect(() => {
    if (settingsData) {
      setEnabled(settingsData.enabled);
      setSelectedDay(settingsData.postDay);
      setPostTime(settingsData.postTime);
      setMessage(settingsData.message);
    }
  }, [settingsData]);

  const validateForm = (): boolean => {
    const formData: SettingsFormData = {
      enabled,
      postDay: selectedDay,
      postTime,
      message,
    };

    const result = settingsSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<keyof SettingsFormData, string>> = {};
      result.error.issues.forEach(error => {
        const field = error.path[0] as keyof SettingsFormData;
        errors[field] = error.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleSave = () => {
    if (isUpdating) return;

    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving.');
      return;
    }

    updateSettings({
      data: {
        enabled,
        postDay: selectedDay,
        postTime,
        message,
      },
    });
  };

  if (isLoadingSettings) {
    return <SettingsLoadingSkeleton />;
  }

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
                  Automatically post your weekly menu at the scheduled time
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-day">Post Day</Label>
                    <Select
                      value={selectedDay}
                      onValueChange={(
                        value: 'SATURDAY' | 'SUNDAY' | 'MONDAY'
                      ) => setSelectedDay(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day to post" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SATURDAY">
                          Saturday (This Week)
                        </SelectItem>
                        <SelectItem value="SUNDAY">
                          Sunday (This Week)
                        </SelectItem>
                        <SelectItem value="MONDAY">
                          Monday (Planned Week)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.postDay && (
                      <p className="text-sm text-destructive">
                        {validationErrors.postDay}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Choose when to post your weekly menu
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-time">Post Time</Label>
                    <Input
                      id="post-time"
                      type="time"
                      value={postTime}
                      onChange={e => setPostTime(e.target.value)}
                      className={
                        validationErrors.postTime ? 'border-destructive' : ''
                      }
                    />
                    {validationErrors.postTime && (
                      <p className="text-sm text-destructive">
                        {validationErrors.postTime}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Time to automatically post
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Post Message</Label>
                  <textarea
                    id="message"
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      validationErrors.message ? 'border-destructive' : ''
                    }`}
                    placeholder="Write your weekly menu post message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                  />
                  {validationErrors.message && (
                    <p className="text-sm text-destructive">
                      {validationErrors.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This message will appear with your weekly menu post (
                    {message.length}/280 characters)
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? (
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
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  R
                </div>
                <div>
                  <div className="font-semibold">Your Restaurant</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedDay === 'SATURDAY'
                      ? 'Saturday'
                      : selectedDay === 'SUNDAY'
                      ? 'Sunday'
                      : 'Monday'}{' '}
                    at {postTime}
                  </div>
                </div>
              </div>

              <p className="text-sm mb-2">{message}</p>

              <div className="w-full h-32 bg-gradient-to-r from-orange-200 to-red-200 rounded-md flex items-center justify-center text-sm text-muted-foreground mb-3">
                Weekly Menu Image
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Facebook className="h-4 w-4 text-muted-foreground" />
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
