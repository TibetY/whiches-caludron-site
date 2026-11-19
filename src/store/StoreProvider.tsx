import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { clearPhotos, prunePhotos } from '../lib/photoDb';
import { photoIdsIn } from '../lib/photos';
import { createSeedStore } from '../lib/seed';
import type { SiteContent, Store } from '../lib/types';
import { StoreContext, type StoreApi } from './context';
import { loadStore, parseStore, saveStore, STORAGE_KEY } from './persistence';
import { hasUnpublishedChanges, storeReducer } from './reducer';

type StoreProviderProps = {
  children: ReactNode;
  /** Start from this store instead of localStorage (used by tests). */
  initialStore?: Store;
};

export function StoreProvider({ children, initialStore }: StoreProviderProps) {
  const [store, dispatch] = useReducer(
    storeReducer,
    initialStore ?? null,
    (initial: Store | null) => initial ?? loadStore(),
  );

  useEffect(() => {
    saveStore(store);
  }, [store]);

  // With the site open in one tab and the dashboard in another, pick up the other tab's changes.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return;
      dispatch({ type: 'replace', store: parseStore(event.newValue) ?? createSeedStore() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((recipe: (draft: SiteContent) => void) => {
    dispatch({ type: 'update', recipe });
  }, []);

  const publish = useCallback(() => {
    // Once published, the draft is all that's live, so photos it doesn't use can go.
    const keep = new Set(photoIdsIn(store.draft));
    dispatch({ type: 'publish', at: new Date().toISOString() });
    prunePhotos(keep).catch(() => undefined);
  }, [store.draft]);

  const reset = useCallback(async () => {
    dispatch({ type: 'reset' });
    await clearPhotos().catch(() => undefined);
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      store,
      draft: store.draft,
      published: store.published,
      publishedAt: store.publishedAt,
      isDirty: hasUnpublishedChanges(store),
      update,
      publish,
      reset,
    }),
    [store, update, publish, reset],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
