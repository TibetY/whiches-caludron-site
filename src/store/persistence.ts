import { createSeedStore } from '../lib/seed';
import type { SiteContent, Store } from '../lib/types';

export const STORAGE_KEY = 'wc:store:v1';

function isContent(value: unknown): value is SiteContent {
  const c = value as Partial<SiteContent> | null;
  return (
    !!c &&
    typeof c === 'object' &&
    !!c.today?.soup &&
    !!c.today.sammie &&
    Array.isArray(c.today.treats) &&
    Array.isArray(c.menu?.items) &&
    !!c.menu.soupPrices &&
    !!c.hours?.week &&
    Array.isArray(c.hours.specials) &&
    !!c.notices?.holiday &&
    !!c.notices.events &&
    !!c.photos?.patio &&
    Array.isArray(c.photos.library) &&
    !!c.contact &&
    Array.isArray(c.reviews)
  );
}

/** Parses a stored store, or returns null when it is missing or not the expected shape. */
export function parseStore(raw: string | null): Store | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Store>;
    if (isContent(value.draft) && isContent(value.published)) {
      return {
        draft: value.draft,
        published: value.published,
        publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : null,
      };
    }
  } catch {
    // corrupt JSON: start again from the seed
  }
  return null;
}

/** The saved store, or the seed content on first load. */
export function loadStore(): Store {
  try {
    return parseStore(window.localStorage.getItem(STORAGE_KEY)) ?? createSeedStore();
  } catch {
    return createSeedStore();
  }
}

export function saveStore(store: Store): void {
  try {
    const raw = JSON.stringify(store);
    // Skipping identical writes also stops two open tabs from echoing each other.
    if (window.localStorage.getItem(STORAGE_KEY) !== raw) {
      window.localStorage.setItem(STORAGE_KEY, raw);
    }
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}
