import seedJson from '@content/seed.json';
import type { SiteContent, Store } from './types';
import { clone } from './utils';

/** A fresh copy of the starting content from content/seed.json. */
export function createSeedContent(): SiteContent {
  return clone(seedJson as SiteContent);
}

export function createSeedStore(): Store {
  const content = createSeedContent();
  return { draft: content, published: clone(content), publishedAt: null };
}
