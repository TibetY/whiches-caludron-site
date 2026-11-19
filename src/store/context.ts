import { createContext, useContext } from 'react';
import type { SiteContent, Store } from '../lib/types';

export type StoreApi = {
  store: Store;
  /** What the dashboard edits. */
  draft: SiteContent;
  /** What the public pages show. */
  published: SiteContent;
  publishedAt: string | null;
  isDirty: boolean;
  update: (recipe: (draft: SiteContent) => void) => void;
  publish: () => void;
  reset: () => Promise<void>;
};

export const StoreContext = createContext<StoreApi | null>(null);

export function useStore(): StoreApi {
  const api = useContext(StoreContext);
  if (!api) throw new Error('useStore must be used inside <StoreProvider>.');
  return api;
}

/** The published content, which is all the public website ever reads. */
export function usePublished(): SiteContent {
  return useStore().published;
}
