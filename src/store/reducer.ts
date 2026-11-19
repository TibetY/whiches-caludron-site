import { createSeedStore } from '../lib/seed';
import type { SiteContent, Store } from '../lib/types';
import { clone, deepEqual } from '../lib/utils';

export type StoreAction =
  /** Edit the draft. The recipe receives a fresh copy, so it may mutate it freely. */
  | { type: 'update'; recipe: (draft: SiteContent) => void }
  /** Copy the draft to the published content. */
  | { type: 'publish'; at: string }
  /** Back to content/seed.json. */
  | { type: 'reset' }
  /** Take a whole store, e.g. one saved by another open tab. */
  | { type: 'replace'; store: Store };

export function storeReducer(state: Store, action: StoreAction): Store {
  switch (action.type) {
    case 'update': {
      const draft = clone(state.draft);
      action.recipe(draft);
      return { ...state, draft };
    }
    case 'publish':
      return { ...state, published: clone(state.draft), publishedAt: action.at };
    case 'reset':
      return createSeedStore();
    case 'replace':
      return action.store;
    default:
      return state;
  }
}

/** True when the draft has changes the website doesn't show yet. */
export function hasUnpublishedChanges(store: Store): boolean {
  return !deepEqual(store.draft, store.published);
}
