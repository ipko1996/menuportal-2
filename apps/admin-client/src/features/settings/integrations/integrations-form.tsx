import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from '@mono-repo/ui';
import { Switch } from '@radix-ui/react-switch';
import { Badge } from 'lucide-react';
import type React from 'react';
import { useAuth } from '@clerk/clerk-react';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  enabled: boolean;
}

export function IntegrationsForm() {
  const { getToken } = useAuth();

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
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Share photos and stories to your Instagram account',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      connected: false,
      enabled: false,
    },
  ]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'http://localhost:3000') return;

      if (event.data.type === 'OAUTH_SUCCESS') {
        const { platform, success } = event.data;

        if (success) {
          setIntegrations(prev =>
            prev.map(i => (i.id === platform ? { ...i, connected: true } : i))
          );

          toast.success(
            `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected`,
            {
              description: `Your ${platform} account has been successfully connected.`,
            }
          );
        } else {
          toast.error('Connection failed', {
            description: `Failed to connect your ${platform} account. Please try again.`,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.connected) {
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
      const FB_APP_ID = false || '796272572985671';
      const BACKEND_REDIRECT_URI = `http://localhost:3000/api/auth/social/callback`;

      let authUrl = '';

      if (integrationId === 'facebook') {
        // Pass the clerkToken in the 'state' parameter
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&scope=pages_manage_posts,pages_read_engagement&redirect_uri=${encodeURIComponent(
          BACKEND_REDIRECT_URI
        )}&state=${encodeURIComponent(clerkToken)}`;
      } else if (integrationId === 'instagram') {
        authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&scope=instagram_basic,instagram_content_publish&redirect_uri=${encodeURIComponent(
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
          <li>3. Your backend will handle the token exchange</li>
          <li>4. Popup closes automatically and connection status updates</li>
          <li>5. Enable auto-posting once connected</li>
        </ol>
      </div>
    </div>
  );
}
