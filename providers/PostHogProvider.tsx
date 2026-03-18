import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // we capture manually below
    capture_pageleave: true,
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (POSTHOG_KEY) {
      posthog.capture('$pageview', { $current_url: window.location.href });
    }
  }, [location.pathname]);

  return <>{children}</>;
}

export { posthog };
