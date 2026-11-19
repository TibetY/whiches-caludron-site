/** Data model from docs/BRIEF.md. */

export type Category = 'sammys' | 'soups' | 'sweets' | 'drinks';
export type MenuLabel = 'napkins' | 'vegetarian' | 'new' | 'spicy';

/** The image blob lives in IndexedDB under `photoId`. */
export type PhotoRef = { photoId: string | null; alt: string };

export type MenuItem = {
  id: string;
  category: Category;
  name: string;
  /** '' = none */
  description: string;
  /** '' = hide the price on the site */
  price: string;
  /** false = hidden from the menu page */
  visible: boolean;
  labels: MenuLabel[];
  photoId: string | null;
};

/** 'HH:MM', 24h */
export type TimeRange = { from: string; to: string };
/** A break means two ranges. */
export type DayHours = { open: boolean; ranges: TimeRange[] };
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type WeekHours = Record<DayKey, DayHours>;
export type SpecialDay = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  label: string;
  closedAllDay: boolean;
  ranges: TimeRange[];
};

export type DoorOverride = 'auto' | 'open' | 'closed';
export type Treat = { id: string; name: string; onCounter: boolean };
export type LibraryPhoto = { photoId: string; name: string; tags: string[] };
export type Review = { quote: string; source: string; rating?: string };

export type SiteContent = {
  today: {
    soup: { name: string; description: string; soldOut: boolean };
    sammie: { name: string; description: string; price: string; soldOut: boolean };
    treats: Treat[];
    doorOverride: DoorOverride;
    /** Yellow banner above Today’s Brew when not empty. */
    note: string;
    photoId: string | null;
  };
  menu: { soupPrices: { cup: string; bowl: string }; items: MenuItem[] };
  hours: { timeZone: 'America/Toronto'; week: WeekHours; specials: SpecialDay[] };
  notices: {
    holiday: { show: boolean; message: string; nextUp: string };
    events: { show: boolean; message: string };
    patioOpen: boolean;
  };
  photos: { patio: PhotoRef; crew: PhotoRef; share: PhotoRef; library: LibraryPhoto[] };
  contact: {
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
    address: string;
    mapsUrl: string;
  };
  reviews: Review[];
};

export type Store = { draft: SiteContent; published: SiteContent; publishedAt: string | null };
