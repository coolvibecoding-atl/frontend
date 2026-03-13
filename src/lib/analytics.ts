'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

interface PageViewData {
  path: string;
  title: string;
  referrer?: string;
}

let analyticsInstance: Analytics | null = null;

class Analytics {
  private sessionId: string;
  private sessionStart: number;
  private pageViews: number = 0;
  private initialized: boolean = false;

  constructor() {
    this.sessionId = '';
    this.sessionStart = 0;
  }

  private initialize(): void {
    if (this.initialized || typeof window === 'undefined') return;
    
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStart = Date.now();
    this.initialized = true;
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    const key = 'ai_mixer_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  private getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }

  pageView(data: PageViewData): void {
    this.initialize();
    this.pageViews++;

    const event = {
      type: 'page_view',
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      pageNumber: this.pageViews,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.send(event);
  }

  trackEvent(event: AnalyticsEvent): void {
    this.initialize();

    const payload = {
      type: 'event',
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.send(payload);
  }

  trackConversion(conversionName: string, value?: number): void {
    this.trackEvent({
      category: 'conversion',
      action: conversionName,
      value,
    });
  }

  trackUpload(status: 'started' | 'completed' | 'failed'): void {
    this.trackEvent({
      category: 'upload',
      action: status,
    });
  }

  trackMixing(status: 'started' | 'completed' | 'failed'): void {
    this.trackEvent({
      category: 'mixing',
      action: status,
    });
  }

  trackPricingView(plan: string): void {
    this.trackEvent({
      category: 'pricing',
      action: 'view',
      label: plan,
    });
  }

  trackPricingClick(plan: string): void {
    this.trackEvent({
      category: 'pricing',
      action: 'click',
      label: plan,
    });
  }

  trackCTAClick(cta: string, location: string): void {
    this.trackEvent({
      category: 'cta',
      action: 'click',
      label: `${location}:${cta}`,
    });
  }

  trackError(errorType: string, errorMessage?: string): void {
    this.trackEvent({
      category: 'error',
      action: errorType,
      label: errorMessage,
    });
  }

  private send(data: Record<string, unknown>): void {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', data);
    }
  }

  getSessionStats(): { sessionId: string; duration: number; pageViews: number } {
    this.initialize();
    return {
      sessionId: this.sessionId,
      duration: this.getSessionDuration(),
      pageViews: this.pageViews,
    };
  }
}

function getAnalytics(): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
}

export function useAnalytics() {
  const initialized = useRef(false);

  const track = useCallback((event: AnalyticsEvent) => {
    getAnalytics().trackEvent(event);
  }, []);

  const pageView = useCallback((data: PageViewData) => {
    getAnalytics().pageView(data);
  }, []);

  const trackConversion = useCallback((name: string, value?: number) => {
    getAnalytics().trackConversion(name, value);
  }, []);

  const trackUpload = useCallback((status: 'started' | 'completed' | 'failed') => {
    getAnalytics().trackUpload(status);
  }, []);

  const trackMixing = useCallback((status: 'started' | 'completed' | 'failed') => {
    getAnalytics().trackMixing(status);
  }, []);

  const trackPricingView = useCallback((plan: string) => {
    getAnalytics().trackPricingView(plan);
  }, []);

  const trackPricingClick = useCallback((plan: string) => {
    getAnalytics().trackPricingClick(plan);
  }, []);

  const trackCTAClick = useCallback((cta: string, location: string) => {
    getAnalytics().trackCTAClick(cta, location);
  }, []);

  const trackError = useCallback((errorType: string, errorMessage?: string) => {
    getAnalytics().trackError(errorType, errorMessage);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getAnalytics().pageView({
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });

    const handlePopState = () => {
      getAnalytics().pageView({
        path: window.location.pathname,
        title: document.title,
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return {
    track,
    pageView,
    trackConversion,
    trackUpload,
    trackMixing,
    trackPricingView,
    trackPricingClick,
    trackCTAClick,
    trackError,
  };
}

export default getAnalytics();
