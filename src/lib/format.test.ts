import { describe, expect, it } from 'vitest';
import {
  externalUrl,
  isPlaceholder,
  joinNaturally,
  menuPriceText,
  PRICE_PLACEHOLDER,
  priceText,
  SHOW_PRICE_PLACEHOLDERS,
  splitAddress,
  telHref,
  tillText,
  todayDisplay,
} from './format';
import { createSeedContent } from './seed';

describe('joinNaturally', () => {
  it('joins lists the way people write them', () => {
    expect(joinNaturally([])).toBe('');
    expect(joinNaturally(['tarts'])).toBe('tarts');
    expect(joinNaturally(['tarts', 'cookies'])).toBe('tarts & cookies');
    expect(joinNaturally(['butter tarts', 'cookies', 'biscuits'])).toBe(
      'butter tarts, cookies & biscuits',
    );
  });
});

describe('tillText', () => {
  it('lists the treats on the counter', () => {
    const { treats } = createSeedContent().today;
    expect(tillText(treats)).toBe('butter tarts & cookies');
    expect(tillText(treats.map((t) => ({ ...t, onCounter: true })))).toBe(
      'butter tarts, cookies & biscuits',
    );
    expect(tillText(treats.map((t) => ({ ...t, onCounter: false })))).toBe('nothing today');
  });
});

describe('priceText', () => {
  it('hides a blank price', () => {
    expect(priceText('')).toBeNull();
    expect(priceText('   ')).toBeNull();
  });

  it('formats prices', () => {
    expect(priceText('12')).toBe('$12');
    expect(priceText('12.5')).toBe('$12.50');
    expect(priceText('$9.75')).toBe('$9.75');
    expect(priceText('Market price')).toBe('Market price');
  });
});

describe('menuPriceText', () => {
  it('shows the [PRICE] marker for unknown prices while the prototype setting is on', () => {
    expect(menuPriceText('')).toBe(SHOW_PRICE_PLACEHOLDERS ? PRICE_PLACEHOLDER : null);
    expect(menuPriceText('14')).toBe('$14');
  });
});

describe('todayDisplay', () => {
  it('falls back to placeholders for blank names', () => {
    const today = createSeedContent().today;
    today.soup.name = ' ';
    today.sammie.name = '';
    today.sammie.price = '11';
    expect(todayDisplay(today)).toEqual({
      soup: '[today’s soup]',
      sammie: '[today’s sammie]',
      price: '$11',
      till: 'butter tarts & cookies',
    });
  });
});

describe('links and addresses', () => {
  it('builds tel: links', () => {
    expect(telHref('343-202-9665')).toBe('tel:+13432029665');
    expect(telHref('1 (613) 355-8080')).toBe('tel:+16133558080');
  });

  it('adds https:// to bare links', () => {
    expect(externalUrl('instagram.com/wichescauldron')).toBe(
      'https://instagram.com/wichescauldron',
    );
    expect(externalUrl('https://www.facebook.com/wichescauldronotown/')).toBe(
      'https://www.facebook.com/wichescauldronotown/',
    );
  });

  it('splits the street from the rest of the address', () => {
    expect(splitAddress(createSeedContent().contact.address)).toEqual({
      street: '2006 Carp Road',
      rest: 'Carp (Ottawa), ON K0A 1L0',
    });
  });

  it('spots bracketed placeholders', () => {
    expect(isPlaceholder('[What goes on it: cheese, sauce, toppings, bread]')).toBe(true);
    expect(isPlaceholder('Deli meats, mozzarella')).toBe(false);
  });
});
