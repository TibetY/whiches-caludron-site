import { useEffect } from 'react';

/**
 * Sets the document title and which surface is showing. The public site and the dashboard
 * use different page backgrounds for overscroll.
 */
export function usePageSetup(title: string, surface: 'site' | 'dashboard'): void {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    document.documentElement.dataset.surface = surface;
  }, [surface]);
}
