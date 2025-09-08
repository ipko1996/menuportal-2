import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Cookie, Check, Settings2, ArrowLeft } from 'lucide-react';
import { cookieManager, CookiePreferences } from '@/utils/cookie-manager';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@mono-repo/ui';

export function ConsentPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Temporary state for UI choices before saving
  const [tempPreferences, setTempPreferences] = useState({
    necessary: true,
    functional: false,
    performance: false,
  });

  useEffect(() => {
    // Check for consent using the manager
    if (!cookieManager.hasConsent()) {
      setShowBanner(true);
    }
  }, []);

  // Delegate all actions to the cookieManager
  const handleAcceptAll = () => {
    const newPreferences: CookiePreferences = {
      ...tempPreferences,
      functional: true,
      performance: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', 'accepted');
    cookieManager.updatePreferences(newPreferences);
  };

  const handleAcceptNecessary = () => {
    const newPreferences: CookiePreferences = {
      ...tempPreferences,
      functional: false,
      performance: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', 'necessary-only');
    cookieManager.updatePreferences(newPreferences);
  };

  const handleSavePreferences = () => {
    const newPreferences = {
      ...tempPreferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', 'custom');
    cookieManager.updatePreferences(newPreferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="max-w-7xl mx-auto shadow-2xl">
        {!showSettings ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-x-2">
                <Cookie className="size-5 text-foreground" />
                <span>Cookie Settings</span>
              </CardTitle>
              <CardDescription>
                We use cookies to enhance your experience. By clicking "Accept
                All", you agree to our use of cookies.
                <Link
                  to="/cookie-policy"
                  className="text-primary underline-offset-4 hover:underline ml-1"
                >
                  Learn more.
                </Link>
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
                Accept All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="w-full sm:w-auto"
              >
                <Settings2 className="mr-2 size-4" />
                Customize
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Customize Cookie Preferences</CardTitle>
              <CardDescription>
                Manage your cookie settings below. Necessary cookies cannot be
                disabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <Label htmlFor="necessary-cookies" className="flex flex-col space-y-1">
                  <span>Necessary Cookies</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Essential for website functionality and security.
                  </span>
                </Label>
                <Switch id="necessary-cookies" checked disabled />
              </div>
              <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <Label htmlFor="functional-cookies" className="flex flex-col space-y-1">
                  <span>Functional Cookies</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Remember your preferences like theme or language.
                  </span>
                </Label>
                <Switch
                  id="functional-cookies"
                  checked={tempPreferences.functional}
                  onCheckedChange={(checked) =>
                    setTempPreferences({ ...tempPreferences, functional: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <Label htmlFor="performance-cookies" className="flex flex-col space-y-1">
                  <span>Performance Cookies</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Help us improve by collecting anonymous usage data.
                  </span>
                </Label>
                <Switch
                  id="performance-cookies"
                  checked={tempPreferences.performance}
                  onCheckedChange={(checked) =>
                    setTempPreferences({ ...tempPreferences, performance: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSavePreferences}
                className="w-full sm:w-auto"
              >
                <Check className="mr-2 size-4" />
                Save Preferences
              </Button>
              <Button
                variant="outline"
                onClick={handleAcceptNecessary}
                className="w-full sm:w-auto"
              >
                Accept Necessary Only
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSettings(false)}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

