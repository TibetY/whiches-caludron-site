import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp, storeWith } from '../../test/render';

// Photos live in IndexedDB, which jsdom lacks: keep them in memory instead.
const photos = vi.hoisted(() => new Map<string, { blob: Blob; name: string }>());
vi.mock('../../lib/photoDb', () => ({
  savePhoto: vi.fn(async (blob: Blob, name: string) => {
    const id = `photo-${photos.size + 1}`;
    photos.set(id, { blob, name });
    return id;
  }),
  getPhoto: vi.fn(async (id: string) => photos.get(id)),
  deletePhoto: vi.fn(async (id: string) => void photos.delete(id)),
  clearPhotos: vi.fn(async () => photos.clear()),
  prunePhotos: vi.fn(async () => undefined),
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-19T12:00:00-05:00'));
  URL.createObjectURL = vi.fn(() => 'blob:mock-photo');
  URL.revokeObjectURL = vi.fn();
  photos.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Phone and desktop each have a Publish button; either works. */
const publishButton = () => screen.getAllByRole('button', { name: 'Publish changes' })[0];
const preview = () => within(screen.getByRole('region', { name: 'How it looks on the website' }));
const statusText = () => screen.getAllByRole('status')[0];

describe('Today’s brew', () => {
  it('updates the preview as you type, then publishes to the home page', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');
    expect(statusText()).toHaveTextContent('Live on the website');

    const soup = screen.getByLabelText(/Soup name/);
    await user.clear(soup);
    await user.type(soup, 'Split Pea');
    expect(preview().getByText('Split Pea')).toBeInTheDocument();
    expect(statusText()).toHaveTextContent('Changes not published yet');

    await user.click(publishButton());
    expect(statusText()).toHaveTextContent('Live on the website');
    expect(screen.getByText('Published! Today’s brew is live on the website.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'See it on the website' }));
    const card = within(screen.getByRole('region', { name: 'Today’s Brew' }));
    expect(card.getByText('Split Pea')).toBeInTheDocument();
  });

  it('keeps unpublished changes off the website', () => {
    renderApp(
      '/',
      (() => {
        const store = storeWith();
        store.draft.today.soup.name = 'Not published yet';
        return store;
      })(),
    );
    const card = within(screen.getByRole('region', { name: 'Today’s Brew' }));
    expect(card.getByText('Potato Parmesan Maple')).toBeInTheDocument();
    expect(card.queryByText('Not published yet')).not.toBeInTheDocument();
  });

  it('has soup quick picks, treat chips and a sold-out switch', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');

    const tomato = screen.getByRole('button', { name: 'Tomato' });
    await user.click(tomato);
    expect(tomato).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/Soup name/)).toHaveValue('Tomato');

    await user.click(screen.getByRole('switch', { name: 'Soup sold out' }));
    expect(screen.getByRole('switch', { name: 'Soup sold out' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(preview().getByText('sold out!')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Add something new'), 'Lemon squares');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('button', { name: 'Lemon squares' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(preview().getByText('butter tarts, cookies & lemon squares')).toBeInTheDocument();
  });

  it('switches the door sign with buttons or arrow keys', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');
    expect(
      screen.getByText('Right now the sign on the website says OPEN (until 4 pm).'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Closed now' }));
    expect(screen.getByRole('radio', { name: 'Closed now' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(
      screen.getByText('The sign stays CLOSED until you set it back to Automatic.'),
    ).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Open now' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Open now' })).toHaveFocus();
  });

  it('stores the photo of the day and shows it in the preview', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');
    const file = new File(['pixels'], 'todays-pot.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Choose a photo'), file);

    expect(await screen.findByText('todays-pot.jpg')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Today’s upload' })).toHaveAttribute(
      'src',
      'blob:mock-photo',
    );
    await user.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(screen.getByLabelText('Choose a photo')).toBeInTheDocument();
  });
});

describe('Menu & prices', () => {
  it('edits prices and visibility, then publishes to the menu page', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard/menu');
    expect(screen.getByRole('heading', { name: 'The Trucker', level: 2 })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Price for The Trucker'), '14');
    await user.click(screen.getByRole('switch', { name: 'Show Roast Chicken on the menu' }));
    await user.click(publishButton());
    expect(screen.getByText('Published! Your menu page is up to date.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'See it on the website' }));
    expect(screen.getByText('$14')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Roast Chicken' })).not.toBeInTheDocument();
  });

  it('adds, edits and deletes items', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp('/dashboard/menu');

    await user.click(screen.getByRole('button', { name: 'Add a drink' }));
    const name = screen.getByLabelText('Name');
    expect(name).toHaveFocus();
    await user.type(name, 'Iced tea');
    expect(screen.getByRole('heading', { name: 'Iced tea', level: 2 })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Napkins recommended!' }));
    expect(screen.getByRole('button', { name: 'Napkins recommended!' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Delete item' }));
    expect(screen.getByRole('heading', { name: 'Pick something to edit' })).toBeInTheDocument();
    expect(screen.queryByText('Iced tea')).not.toBeInTheDocument();
  });

  it('filters by category and search', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard/menu');
    await user.click(screen.getByRole('button', { name: 'Sweets' }));
    expect(screen.queryByRole('region', { name: /Sammys/ })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Sweets/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.type(screen.getByLabelText('Search the menu'), 'zzz');
    expect(screen.getByText('Nothing on the menu matches “zzz”.')).toBeInTheDocument();
  });
});

describe('Hours & notices', () => {
  it('feeds hours and notices to the home page', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard/hours');
    expect(screen.getByText(/Fridays already have one, from 2:30 to 4:30/)).toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Open on Monday' }));
    await user.click(screen.getByRole('switch', { name: 'Show Holiday specials on the website' }));
    await user.click(publishButton());
    await user.click(screen.getByRole('link', { name: 'See it on the website' }));

    expect(screen.getByText('Mon – Sat, 11 to 4')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Holiday specials' })).not.toBeInTheDocument();
  });

  it('adds and removes special days', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard/hours');
    expect(screen.getByText('Nothing coming up.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a date first.');

    await user.type(screen.getByLabelText('Date'), '2026-12-25');
    await user.type(screen.getByLabelText('What’s happening'), 'Christmas Day');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    const list = within(screen.getByRole('list'));
    expect(list.getByText('Christmas Day')).toBeInTheDocument();
    expect(list.getByText('Closed all day')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('Nothing coming up.')).toBeInTheDocument();
  });
});

describe('dashboard shell', () => {
  it('starts from the seed and resets demo data', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderApp(
      '/dashboard',
      storeWith((c) => {
        c.today.soup.name = 'Changed';
      }),
    );
    expect(screen.getByLabelText(/Soup name/)).toHaveValue('Changed');
    await user.click(screen.getAllByRole('button', { name: 'Reset demo data' })[0]);
    expect(screen.getByLabelText(/Soup name/)).toHaveValue('Potato Parmesan Maple');
  });

  it('opens the phone menu', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard/photos');
    const toggle = screen.getByRole('button', { name: 'Open the dashboard menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Close the dashboard menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByRole('link', { name: 'Photos' })[0]).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText(/No photos yet\. Upload a few sammies/)).toBeInTheDocument();
  });
});
