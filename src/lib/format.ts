import type { SiteContent, Treat } from './types';

/** ['a'] → 'a' · ['a', 'b'] → 'a & b' · ['a', 'b', 'c'] → 'a, b & c' */
export function joinNaturally(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} & ${items[items.length - 1]}`;
}

/** “By the till”: the treats on the counter, joined naturally, or “nothing today”. */
export function tillText(treats: Treat[]): string {
  const names = treats
    .filter((t) => t.onCounter && t.name.trim())
    .map((t) => t.name.trim().toLowerCase());
  return names.length ? joinNaturally(names) : 'nothing today';
}

/**
 * A price as the website shows it, or null to show nothing: a blank price hides the price
 * (docs/BRIEF.md). '12.5' → '$12.50', '$9' → '$9'.
 */
export function priceText(price: string): string | null {
  const raw = price.trim().replace(/^\$\s*/, '');
  if (!raw) return null;
  const padded = /^\d+\.\d$/.test(raw) ? `${raw}0` : raw;
  return /^\d/.test(padded) ? `$${padded}` : padded;
}

/**
 * Prototype setting. While the owners are still sending their prices, a blank menu price shows
 * the visible “[PRICE]” marker from the designs (docs/CONTENT.md: unknown prices stay visible
 * placeholders). Set this to false before launch: a blank price then hides the price entirely,
 * as docs/BRIEF.md specifies.
 */
export const SHOW_PRICE_PLACEHOLDERS = true;
export const PRICE_PLACEHOLDER = '[PRICE]';

/** A menu price for the website: '$12.50', the [PRICE] marker, or null to show nothing. */
export function menuPriceText(price: string): string | null {
  return priceText(price) ?? (SHOW_PRICE_PLACEHOLDERS ? PRICE_PLACEHOLDER : null);
}

/** What the Today’s Brew card shows for the current `today` content. */
export function todayDisplay(today: SiteContent['today']) {
  return {
    soup: today.soup.name.trim() || '[today’s soup]',
    sammie: today.sammie.name.trim() || '[today’s sammie]',
    price: priceText(today.sammie.price),
    till: tillText(today.treats),
  };
}

/** '343-202-9665' → 'tel:+13432029665' */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `tel:+${digits}`;
  return `tel:${digits}`;
}

/** Adds https:// to links typed without it, like 'instagram.com/wichescauldron'. */
export function externalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '#';
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
}

/** '2006 Carp Road, Carp (Ottawa), ON K0A 1L0' → { street: '2006 Carp Road', rest: 'Carp (Ottawa), ON K0A 1L0' } */
export function splitAddress(address: string): { street: string; rest: string } {
  const comma = address.indexOf(',');
  if (comma === -1) return { street: address.trim(), rest: '' };
  return { street: address.slice(0, comma).trim(), rest: address.slice(comma + 1).trim() };
}

export function mapsUrlFor(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address.trim()).replace(/%20/g, '+')}`;
}

/** True for bracketed placeholders such as “[What goes on it: cheese, sauce, toppings, bread]”. */
export function isPlaceholder(text: string): boolean {
  return /^\[.*\]$/s.test(text.trim());
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
