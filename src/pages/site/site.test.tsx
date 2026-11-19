import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp, storeWith } from '../../test/render';

// Thursday 2026-11-19, noon in Toronto: open until 4.
const THURSDAY_NOON = new Date('2026-11-19T12:00:00-05:00');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(THURSDAY_NOON);
});

afterEach(() => {
  vi.useRealTimers();
});

const todayCard = () => {
  const section = screen.getByRole('region', { name: 'Today’s Brew' });
  return within(section);
};

describe('home page', () => {
  it('shows the published Today’s Brew from the seed', () => {
    renderApp('/');
    const card = todayCard();
    expect(card.getByText('Potato Parmesan Maple')).toBeInTheDocument();
    expect(card.getByText('The Trucker')).toBeInTheDocument();
    expect(card.getByText('butter tarts & cookies')).toBeInTheDocument();
    expect(card.queryByText('sold out!')).not.toBeInTheDocument();
    expect(card.queryByText(/^\$/)).not.toBeInTheDocument();
  });

  it('reflects sold out, price, treats, note and blanks', () => {
    renderApp(
      '/',
      storeWith((c) => {
        c.today.soup.soldOut = true;
        c.today.sammie.price = '12.5';
        c.today.treats.forEach((t) => (t.onCounter = true));
        c.today.note = 'Closing at 2 today for a private event';
      }),
    );
    const card = todayCard();
    expect(card.getAllByText('sold out!')).toHaveLength(1);
    expect(card.getByText('$12.50')).toBeInTheDocument();
    expect(card.getByText('butter tarts, cookies & biscuits')).toBeInTheDocument();
    expect(card.getByText('Closing at 2 today for a private event')).toBeInTheDocument();
  });

  it('says “nothing today” when nothing is by the till', () => {
    renderApp(
      '/',
      storeWith((c) => c.today.treats.forEach((t) => (t.onCounter = false))),
    );
    expect(todayCard().getByText('nothing today')).toBeInTheDocument();
  });

  it('drives every hours list from the published hours', () => {
    renderApp('/');
    expect(screen.getByText('Tue – Sat, 11 to 4')).toBeInTheDocument();
    expect(screen.getByText('Fri 11–2:30 & 4:30–7 · closed Sun & Mon')).toBeInTheDocument();
    expect(screen.getByText(/Tue – Sat 11 am – 4 pm · Fri 11–2:30 & 4:30–7/)).toBeInTheDocument();
    expect(screen.getByText('open Tuesday to Saturday from 11')).toBeInTheDocument();
    const visit = within(screen.getByRole('region', { name: 'Come find the cauldron' }));
    expect(visit.getByText('Tue – Thu')).toBeInTheDocument();
    expect(visit.getByText('Sun & Mon')).toBeInTheDocument();
  });

  it('shows the door sign in Toronto time, and the owners’ override', () => {
    const { unmount } = renderApp('/');
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('until 4 pm today')).toBeInTheDocument();
    unmount();

    renderApp(
      '/',
      storeWith((c) => (c.today.doorOverride = 'closed')),
    );
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
    expect(screen.getByText('back tomorrow at 11 am')).toBeInTheDocument();
  });

  it('shows and hides notice stickers', () => {
    const { unmount } = renderApp(
      '/',
      storeWith((c) => (c.notices.holiday.nextUp = 'Valentine’s Day, February 14')),
    );
    expect(screen.getByRole('heading', { name: 'Holiday specials' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private events' })).toBeInTheDocument();
    expect(screen.getByText('Next up: Valentine’s Day, February 14')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Patio season' })).toBeInTheDocument();
    unmount();

    renderApp(
      '/',
      storeWith((c) => {
        c.notices.holiday.show = false;
        c.notices.events.show = false;
        c.notices.patioOpen = true;
      }),
    );
    expect(screen.queryByRole('heading', { name: 'Holiday specials' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Private events' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The patio’s open!' })).toBeInTheDocument();
  });

  it('keeps the design’s placeholders for content still to come', () => {
    renderApp('/');
    const trucker = within(screen.getByRole('region', { name: 'The Trucker' }));
    expect(trucker.getByText('[PRICE]')).toBeInTheDocument();
    expect(screen.getAllByText('[PRICE]')).toHaveLength(3);
    expect(screen.getByText('— [Owner names] & the Cauldron crew')).toBeInTheDocument();
    expect(screen.getByText('[photo: the patio in summer]')).toBeInTheDocument();
    expect(screen.getByText('[map: 2006 Carp Road, Carp]')).toBeInTheDocument();
  });
});

describe('menu page', () => {
  it('lists the visible items from the seed', () => {
    renderApp('/menu');
    expect(screen.getByRole('heading', { level: 1, name: 'the menu' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Trucker' })).toBeInTheDocument();
    expect(screen.getByText('napkins recommended!')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Roast Chicken' })).toBeInTheDocument();
    expect(screen.getByText('Butter tarts')).toBeInTheDocument();
    // every seed price is still unknown, so the design's [PRICE] markers show
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(screen.getAllByText('[PRICE]')).toHaveLength(9);
    expect(screen.getByText('cup [PRICE]')).toBeInTheDocument();
    expect(screen.getByText('[Soft drinks]')).toBeInTheDocument();
  });

  it('hides hidden items and shows prices and labels once set', () => {
    renderApp(
      '/menu',
      storeWith((c) => {
        const item = (id: string) => c.menu.items.find((i) => i.id === id)!;
        item('roast-chicken').visible = false;
        item('trucker').price = '14';
        item('trucker').labels.push('new');
        item('cookies').labels.push('vegetarian');
        c.menu.soupPrices = { cup: '5.5', bowl: '8' };
        c.menu.items.push({
          id: 'pop',
          category: 'drinks',
          name: 'Pop',
          description: '',
          price: '2',
          visible: true,
          labels: [],
          photoId: null,
        });
      }),
    );
    expect(screen.queryByRole('heading', { name: 'Roast Chicken' })).not.toBeInTheDocument();
    expect(screen.getByText('$14')).toBeInTheDocument();
    expect(screen.getByText('new!')).toBeInTheDocument();
    expect(screen.getByTitle('vegetarian')).toHaveTextContent('V');
    expect(screen.getByText('cup $5.50')).toBeInTheDocument();
    expect(screen.getByText('bowl $8')).toBeInTheDocument();
    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.queryByText('[Soft drinks]')).not.toBeInTheDocument();
  });
});
