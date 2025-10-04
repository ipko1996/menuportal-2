import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@mono-repo/ui';
import { Switch } from '@mono-repo/ui/switch';
import type React from 'react';
import { useAuth } from '@clerk/clerk-react';

import { useGetSocials } from '@mono-repo/api-client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  enabled: boolean;
  accountName?: string;
}

export function IntegrationsForm() {
  const { getToken } = useAuth();

  // 1. Get the refetch function from the hook
  const { data: connectedSocials, refetch: refetchSocials } = useGetSocials();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Post content to your Facebook pages and manage posts',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      connected: false,
      enabled: false,
    },
    // ... other integrations
  ]);

  useEffect(() => {
    if (connectedSocials) {
      setIntegrations(prev =>
        prev.map(integration => {
          const connectedAccount = connectedSocials.find(
            acc => acc.platform.toLowerCase() === integration.id
          );

          if (connectedAccount) {
            return {
              ...integration,
              connected: true,
              enabled: connectedAccount.isActive,
              accountName: connectedAccount.accountName,
            };
          }
          // Reset to default if not in the connected list
          return {
            ...integration,
            connected: false,
            enabled: false,
            accountName: undefined,
          };
        })
      );
    }
  }, [connectedSocials]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_MENUPORTAL_BACKEND_URL) return;

      if (event.data.type === 'OAUTH_SUCCESS') {
        const { platform, success } = event.data;

        if (success) {
          setIntegrations(prev =>
            prev.map(i =>
              i.id === platform
                ? { ...i, connected: true, enabled: true } // Also enable by default on connect
                : i
            )
          );

          toast.success(
            `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected`,
            {
              description: `Your ${platform} account has been successfully connected.`,
            }
          );

          // 2. Call refetch to get the latest data from the backend
          refetchSocials();
        } else {
          toast.error('Connection failed', {
            description: `Failed to connect your ${platform} account. Please try again.`,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetchSocials]);

  const handleConnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.connected) {
      // TODO: Implement a backend endpoint to handle disconnection logic
      setIntegrations(prev =>
        prev.map(i =>
          i.id === integrationId
            ? { ...i, connected: false, enabled: false }
            : i
        )
      );
      toast.success(`${integration.name} disconnected`, {
        description: `Your ${integration.name} account has been disconnected.`,
      });
    } else {
      const clerkToken = await getToken();
      if (!clerkToken) {
        toast.error('Authentication error', {
          description:
            'Could not get authentication token. Please sign in again.',
        });
        return;
      }

      const FB_APP_ID = import.meta.env.VITE_FB_APP_ID;
      const BACKEND_REDIRECT_URI = import.meta.env.VITE_FB_CALLBACK_URL;

      let authUrl = '';

      if (integrationId === 'facebook') {
        // Pass the clerkToken in the 'state' parameter
        authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${FB_APP_ID}&scope=pages_manage_posts,pages_read_engagement&redirect_uri=${encodeURIComponent(
          BACKEND_REDIRECT_URI
        )}&state=${encodeURIComponent(clerkToken)}`;
      } else if (integrationId === 'instagram') {
        authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${FB_APP_ID}&scope=instagram_basic,instagram_content_publish&redirect_uri=${encodeURIComponent(
          BACKEND_REDIRECT_URI
        )}&state=instagram`;
      }

      const popup = window.open(
        authUrl,
        'oauth-popup',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        toast.error('Popup blocked', {
          description: 'Please allow popups for this site and try again.',
        });
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  const handleToggle = (integrationId: string, enabled: boolean) => {
    // TODO: Add an API call here to persist the `enabled` (isActive) state
    setIntegrations(prev =>
      prev.map(i => (i.id === integrationId ? { ...i, enabled } : i))
    );

    const integration = integrations.find(i => i.id === integrationId);
    toast(`${integration?.name} ${enabled ? 'enabled' : 'disabled'}`, {
      description: `Auto-posting to ${integration?.name} has been ${
        enabled ? 'enabled' : 'disabled'
      }.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {integrations.map(integration => (
          <Card key={integration.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {integration.icon}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {integration.name}
                  </CardTitle>
                  <CardDescription>{integration.description}</CardDescription>

                  {integration.connected && integration.accountName && (
                    <p className="pt-1 text-sm text-muted-foreground">
                      Connected as:{' '}
                      <span className="font-medium text-primary">
                        {integration.accountName}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={integration.connected ? 'default' : 'secondary'}
                >
                  {integration.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={integration.connected ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                  {integration.connected && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={enabled =>
                          handleToggle(integration.id, enabled)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Auto-post enabled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-medium mb-2">Integration Flow</h4>
        <ol className="text-sm text-muted-foreground space-y-1">
          <li>1. Click "Connect" to open OAuth popup window</li>
          <li>2. Authorize with Facebook/Instagram in the popup</li>
          <li>3. Popup closes automatically and connection status updates</li>
          <li>4. Enable auto-posting once connected</li>
        </ol>
      </div>
    </div>
  );
}
