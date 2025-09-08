// apps/admin-client/src/utils/cookie-manager.ts

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  performance: boolean;
  timestamp: string;
}

class CookieManager {
  private static instance: CookieManager;
  private preferences: CookiePreferences | null = null;

  private constructor() {
    this.loadPreferences();
  }

  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  private loadPreferences() {
    const stored = localStorage.getItem('cookie-preferences');
    if (stored) {
      this.preferences = JSON.parse(stored);
      this.applyPreferences();
    }
  }

  private applyPreferences() {
    if (!this.preferences) return;

    // Apply performance cookies (Cloudflare Analytics)
    if (this.preferences.performance) {
      // TODO: Not yet used
      //   this.enableCloudflareAnalytics();
    }

    // Apply functional cookies
    if (this.preferences.functional) {
      // Theme preference is already handled by ThemeProvider
      console.log('Functional cookies enabled');
    }
  }

  private enableCloudflareAnalytics() {
    // Add Cloudflare Analytics script if not already present
    if (!document.querySelector('#cf-analytics')) {
      const script = document.createElement('script');
      script.id = 'cf-analytics';
      script.defer = true;
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.setAttribute('data-cf-beacon', '{"token": "YOUR_CF_TOKEN"}');
      document.head.appendChild(script);
    }
  }

  hasConsent(): boolean {
    return localStorage.getItem('cookie-consent') !== null;
  }

  hasPerformanceConsent(): boolean {
    return this.preferences?.performance ?? false;
  }

  hasFunctionalConsent(): boolean {
    return this.preferences?.functional ?? false;
  }

  updatePreferences(newPreferences: CookiePreferences) {
    this.preferences = newPreferences;
    localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));

    // Reload page to apply new preferences
    window.location.reload();
  }

  revokeConsent() {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');

    // Clear all cookies except necessary ones
    document.cookie.split(';').forEach(c => {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();

      // Don't delete necessary cookies (like auth tokens)
      if (!name.startsWith('__clerk') && !name.startsWith('auth')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });

    // Reload to show banner again
    window.location.reload();
  }
}

export const cookieManager = CookieManager.getInstance();

// Hook for React components
import { useState, useEffect } from 'react';

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null
  );

  useEffect(() => {
    setHasConsent(cookieManager.hasConsent());
    const stored = localStorage.getItem('cookie-preferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  return {
    hasConsent,
    preferences,
    hasPerformanceConsent: cookieManager.hasPerformanceConsent(),
    hasFunctionalConsent: cookieManager.hasFunctionalConsent(),
    revokeConsent: () => cookieManager.revokeConsent(),
  };
}
