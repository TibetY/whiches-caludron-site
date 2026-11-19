# Build brief: ’Wiches Cauldron React prototype

## Goal
Turn the approved designs into a working front-end prototype. The shop owners should be able to open the dashboard, change today’s soup, press **Publish changes**, and see the public site update.

There's no server. Everything runs in the browser.

## Routes

| Route | Design reference | Notes |
|---|---|---|
| `/` | `design/Main.dc.html` | Public home page |
| `/menu` | `design/Menu.dc.html` | Public menu page |
| `/dashboard` | `design/Admin-Today.dc.html` (desktop), `design/Admin-Phone.dc.html` (mobile) | Today’s brew. **One responsive page**: the phone artboard shows how it should collapse, not a separate route |
| `/dashboard/menu` | `design/Admin-Menu.dc.html` | Menu & prices |
| `/dashboard/photos` | `design/Admin-Photos.dc.html` | Photos |
| `/dashboard/hours` | `design/Admin-Hours.dc.html` | Hours & notices |

The dashboard has no login for now. Add a small "Prototype: no login yet" note in the sidebar footer.

## Data and state (no backend)

```ts
type PhotoRef = { photoId: string | null; alt: string };   // the blob lives in IndexedDB under photoId

type MenuItem = {
  id: string;
  category: 'sammys' | 'soups' | 'sweets' | 'drinks';
  name: string;
  description: string;      // '' = none
  price: string;            // '' = hide the price on the site
  visible: boolean;         // false = hidden from the menu page
  labels: Array<'napkins' | 'vegetarian' | 'new' | 'spicy'>;
  photoId: string | null;
};

type TimeRange = { from: string; to: string };             // 'HH:MM', 24h
type DayHours = { open: boolean; ranges: TimeRange[] };    // a break means two ranges
type SpecialDay = { id: string; date: string /* YYYY-MM-DD */; label: string; closedAllDay: boolean; ranges: TimeRange[] };

type SiteContent = {
  today: {
    soup: { name: string; description: string; soldOut: boolean };
    sammie: { name: string; description: string; price: string; soldOut: boolean };
    treats: Array<{ id: string; name: string; onCounter: boolean }>;
    doorOverride: 'auto' | 'open' | 'closed';
    note: string;                       // yellow banner above Today’s Brew when not empty
    photoId: string | null;
  };
  menu: { soupPrices: { cup: string; bowl: string }; items: MenuItem[] };
  hours: { timeZone: 'America/Toronto'; week: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', DayHours>; specials: SpecialDay[] };
  notices: { holiday: { show: boolean; message: string; nextUp: string }; events: { show: boolean; message: string }; patioOpen: boolean };
  photos: { patio: PhotoRef; crew: PhotoRef; share: PhotoRef; library: Array<{ photoId: string; name: string; tags: string[] }> };
  contact: { phone: string; email: string; instagram: string; facebook: string; address: string; mapsUrl: string };
  reviews: Array<{ quote: string; source: string; rating?: string }>;
};

type Store = { draft: SiteContent; published: SiteContent; publishedAt: string | null };
```

- Seed the store from `content/seed.json` on first load.
- Persist the store to `localStorage` under the key `wc:store:v1`.
- Listen for the `storage` event, so that with the site open in one tab and the dashboard in another, publishing updates the site tab live.
- Keep the store as React context with `useReducer`, or Zustand. Either is fine; keep it tiny.
- The dashboard edits `draft`. The public pages read `published`.
- When `draft` differs from `published`, show the "Changes not published yet" status pill. When they match, show "Live on the website".
- **Publish changes** copies `draft` to `published`, sets `publishedAt` and shows the success toast. The toast includes a "See it on the website" link.
- Photos:
  - Store uploaded files as blobs in IndexedDB. A tiny wrapper or `idb-keyval` is fine.
  - Keep only the `photoId` in the store, and render photos with object URLs created from the blobs.
- The dashboard sidebar footer has a "Reset demo data" button.

## Behaviours to get right

1. **Door sign and "open now"**: `getDoorStatus(now, hours, specials, override)` returns `{ open, note }`.
   - Evaluate the time in America/Toronto, whatever the browser's time zone.
   - Notes read like "until 4 pm", "opening today at 11 am", "back today at 4:30 pm" (the Friday break), "back tomorrow at 11 am" and "back Tuesday at 11 am".
   - A special day overrides the regular hours for its date.
   - An override of `open` or `closed` wins over everything, and its note is "until you switch it back".
   - Unit-test at least these cases: Friday 15:00 → closed, "back today at 4:30 pm". Friday 17:00 → open, "until 7 pm". Saturday 16:30 → closed, "back Tuesday at 11 am". Sunday → closed, "back Tuesday at 11 am". Tuesday 10:00 → closed, "opening today at 11 am".
2. **Today’s Brew card** on the home page. It is driven by `published.today`:
   - When the soup or sammie is sold out, strike through its name and add a red "sold out!" sticker.
   - Show the sammie's price; if the price is blank, show nothing.
   - "By the till" lists the treats that are on the counter, joined naturally: "butter tarts, cookies & biscuits". If none are on, show "nothing today".
   - Show the note banner and the photo of the day when they're set.
3. **The dashboard Today page** shows a live preview of that card, built from `draft`, next to the form.
   - Soup quick-pick chips for the three regular soups.
   - "Add something new" adds a treat chip.
   - The door control is a three-way radiogroup: Automatic / Open now / Closed now. Under it, explain what the sign currently says.
4. **The menu page** lists only items that are visible. A blank price shows no price. The soups section shows the cup and bowl prices. An item with the `napkins` label shows the handwritten "napkins recommended!" note.
5. **Hours appear in several places**: the hours ribbon, the "Come find the cauldron" list, the footer and the door sign. All of them come from `published.hours`.
   - Format Friday as "Fri 11–2:30 & 4:30–7".
6. **Notices**:
   - Holiday specials, private events and patio status drive the matching stickers in "News & nice words".
   - When a notice's `show` is false, its sticker is hidden.
7. **Photos**:
   - The patio, crew and link-preview slots render on the site when set, using their alt text.
   - The link-preview photo should feed an `og:image` tag later. For now, render it in the dashboard only.

## Layout and responsiveness
- The public pages are fluid, with a max content width of 1200px. They must work at 360px wide: everything stacks and nothing scrolls sideways.
- The dashboard has a purple sidebar with content beside it. Below about 900px the sidebar becomes a top bar with a menu button.
  - On a phone, `/dashboard` should look like `design/Admin-Phone.dc.html`, with a sticky bottom bar holding the Publish button.
- Wide tables (menu items, weekly hours) scroll inside their own box on small screens.

## Build phases (stop and show the user after each)
1. **Scaffold**: Vite + React + TS, routing, tokens, fonts, and the shared UI pieces from CLAUDE.md. Make `npm run dev/build/test/lint` all work.
2. **Public pages from the seed data**: Home and Menu matching the artboards. The store is read-only at this stage.
3. **Store and Today’s brew**: the store with persistence and publishing, the door-sign logic with its tests, the `/dashboard` page with live preview, and the home card wired to the published content.
4. **Menu & prices, Photos, Hours & notices**: wire each page to the store, with IndexedDB for photos.
5. **Polish**: an accessibility pass (target Lighthouse accessibility 95 or higher), empty states, reset demo data, and a README for running it.

## Acceptance criteria
- [ ] `npm run dev` serves all six routes; `npm run build`, `npm test` and `npm run lint` pass.
- [ ] Home and Menu visually match the artboards: fonts, colours, outlines, stickers, ribbons, swirls, waves, awning.
- [ ] Changing the soup in `/dashboard` updates the preview instantly. After **Publish changes**, `/` shows it, including in a second open tab.
- [ ] Sold-out, price, treats, note and photo of the day all reflect correctly on the home page.
- [ ] The door sign is correct in America/Toronto time, including the Friday break and special days; the tests pass.
- [ ] Menu edits (price, visibility, labels, photo) show on `/menu` after publishing.
- [ ] Hours and notices edits show on the hours ribbon, the visit section, the footer and the stickers.
- [ ] Everything persists across a reload. "Reset demo data" restores the seed content.
- [ ] Usable at 360px wide; keyboard-operable; visible focus; no contrast failures.

## Out of scope for now
- Accounts, login and permissions.
- A real backend or hosting.
- Online ordering and payments.
- Embedding the real Google Map. Keep the placeholder until the address pin is confirmed.
