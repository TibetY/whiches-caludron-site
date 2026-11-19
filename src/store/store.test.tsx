import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createSeedStore } from '../lib/seed';
import { useStore } from './context';
import { loadStore, parseStore, saveStore, STORAGE_KEY } from './persistence';
import { hasUnpublishedChanges, storeReducer } from './reducer';
import { StoreProvider } from './StoreProvider';

describe('storeReducer', () => {
  it('edits the draft only', () => {
    const start = createSeedStore();
    const next = storeReducer(start, {
      type: 'update',
      recipe: (d) => {
        d.today.soup.name = 'Tomato';
      },
    });
    expect(next.draft.today.soup.name).toBe('Tomato');
    expect(next.published.today.soup.name).toBe('Potato Parmesan Maple');
    expect(start.draft.today.soup.name).toBe('Potato Parmesan Maple');
    expect(hasUnpublishedChanges(next)).toBe(true);
  });

  it('publishes a copy of the draft', () => {
    const edited = storeReducer(createSeedStore(), {
      type: 'update',
      recipe: (d) => {
        d.today.sammie.price = '12.50';
      },
    });
    const published = storeReducer(edited, { type: 'publish', at: '2026-11-19T17:00:00.000Z' });
    expect(published.published.today.sammie.price).toBe('12.50');
    expect(published.publishedAt).toBe('2026-11-19T17:00:00.000Z');
    expect(hasUnpublishedChanges(published)).toBe(false);
    expect(published.published).not.toBe(published.draft);
  });

  it('counts an edit undone by hand as no change', () => {
    const store = createSeedStore();
    const changed = storeReducer(store, {
      type: 'update',
      recipe: (d) => {
        d.today.note = 'Closing at 2';
      },
    });
    const undone = storeReducer(changed, {
      type: 'update',
      recipe: (d) => {
        d.today.note = '';
      },
    });
    expect(hasUnpublishedChanges(undone)).toBe(false);
  });

  it('resets to the seed content', () => {
    const edited = storeReducer(createSeedStore(), {
      type: 'update',
      recipe: (d) => {
        d.menu.items = [];
      },
    });
    expect(storeReducer(edited, { type: 'reset' })).toEqual(createSeedStore());
  });
});

describe('persistence', () => {
  it('round-trips through localStorage', () => {
    const store = createSeedStore();
    store.draft.today.soup.name = 'Tomato';
    saveStore(store);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}').draft.today.soup.name).toBe(
      'Tomato',
    );
    expect(loadStore().draft.today.soup.name).toBe('Tomato');
  });

  it('falls back to the seed for missing or broken data', () => {
    expect(parseStore(null)).toBeNull();
    expect(parseStore('{not json')).toBeNull();
    expect(parseStore(JSON.stringify({ draft: {}, published: {} }))).toBeNull();
    window.localStorage.setItem(STORAGE_KEY, '{"draft": 1}');
    expect(loadStore()).toEqual(createSeedStore());
  });
});

function SoupProbe() {
  const { draft, published, isDirty, update, publish } = useStore();
  return (
    <div>
      <p>draft: {draft.today.soup.name}</p>
      <p>published: {published.today.soup.name}</p>
      <p>{isDirty ? 'dirty' : 'clean'}</p>
      <button
        type="button"
        onClick={() =>
          update((d) => {
            d.today.soup.name = 'Tomato';
          })
        }
      >
        Change soup
      </button>
      <button type="button" onClick={publish}>
        Publish
      </button>
    </div>
  );
}

describe('StoreProvider', () => {
  it('saves every change and publish to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <StoreProvider>
        <SoupProbe />
      </StoreProvider>,
    );
    expect(screen.getByText('clean')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Change soup' }));
    expect(screen.getByText('draft: Tomato')).toBeInTheDocument();
    expect(screen.getByText('published: Potato Parmesan Maple')).toBeInTheDocument();
    expect(screen.getByText('dirty')).toBeInTheDocument();
    expect(parseStore(window.localStorage.getItem(STORAGE_KEY))?.draft.today.soup.name).toBe(
      'Tomato',
    );

    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(screen.getByText('published: Tomato')).toBeInTheDocument();
    expect(screen.getByText('clean')).toBeInTheDocument();
    expect(parseStore(window.localStorage.getItem(STORAGE_KEY))?.published.today.soup.name).toBe(
      'Tomato',
    );
  });

  it('picks up changes published from another tab', () => {
    render(
      <StoreProvider>
        <SoupProbe />
      </StoreProvider>,
    );
    const other = createSeedStore();
    other.draft.today.soup.name = 'Cream of Cauliflower Three-Cheese';
    other.published.today.soup.name = 'Cream of Cauliflower Three-Cheese';

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(other) }),
      );
    });
    expect(screen.getByText('published: Cream of Cauliflower Three-Cheese')).toBeInTheDocument();
  });
});
