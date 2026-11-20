# ’Wiches Cauldron: website + shop dashboard

Front-end prototype for **’Wiches Cauldron Sandwich Shoppe**, 2006 Carp Road, Carp (Ottawa), Ontario.

- **The website**: Home (`/`) and Menu (`/menu`).
- **The shop dashboard**: where the owners update today’s soup and sammie, the menu and prices, photos, hours and notices (`/dashboard`).

There is no backend yet. Everything runs in the browser: content is saved to `localStorage`, photos to IndexedDB. The dashboard edits a **draft**; the website only shows what was last **published**.

The design handoff this was built from is in the repo: [`CLAUDE.md`](CLAUDE.md), [`docs/`](docs) (brief, design system, content notes), [`design/`](design) (the approved artboards) and [`content/seed.json`](content/seed.json).

## Running it

Needs Node 22.12 or newer.

```bash
npm install
npm run dev          # http://localhost:5173
```

| Route               | Page                       |
| ------------------- | -------------------------- |
| `/`                 | Home                       |
| `/menu`             | Menu                       |
| `/dashboard`        | Dashboard: Today’s brew    |
| `/dashboard/menu`   | Dashboard: Menu & prices   |
| `/dashboard/photos` | Dashboard: Photos          |
| `/dashboard/hours`  | Dashboard: Hours & notices |

From the website, the owners get to the dashboard through **For the owners** in the footer.

To try it on a phone, run `npm run dev:host` and open the “Network” address it prints from a phone on the same Wi-Fi.

To see publishing work, open the website in one tab and the dashboard in another. Change today’s soup, press **Publish changes**, and the website tab updates by itself.

### Scripts

| Script             | What it does                            |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Dev server                              |
| `npm run dev:host` | Dev server reachable from other devices |
| `npm run build`    | Type-check and build to `dist/`         |
| `npm run preview`  | Serve the production build              |
| `npm test`         | Unit and component tests (Vitest)       |
| `npm run lint`     | ESLint, including `jsx-a11y`            |
| `npm run format`   | Prettier                                |

## How it works

- **Store** (`src/store/`): a small React context with `useReducer`. It holds `{ draft, published, publishedAt }` and saves it to `localStorage` under `wc:store:v1`. Other open tabs pick up changes through the `storage` event. **Reset demo data** in the dashboard menu brings back `content/seed.json`.
- **Door sign and hours** (`src/lib/hours.ts`): pure functions, evaluated in America/Toronto whatever the browser’s time zone. They handle the Friday break, special days and the owners’ open/closed override. Every hours list on the site (the ribbon, “Come find the cauldron”, the footer) is generated from the published hours. Tests are in `src/lib/hours.test.ts`.
- **Photos** (`src/lib/photoDb.ts`, `src/lib/photos.ts`): uploads are scaled down to a sensible size and stored as blobs in IndexedDB; the content only keeps their ids. Photos nothing refers to any more are removed after publishing.
- **Design system** (`src/styles/tokens.css`, `src/components/ui/`): the tokens from `docs/DESIGN.md` and the shared pieces (`StickerCard`, `Ribbon`, `OutlinedHeading`, `CartoonButton`, `Switch`, `Chip`, `SwirlBand`, `WaveDivider`, `Awning`). The illustrations are the SVGs in `assets/svg/`, imported as React components.
- **Mobile first**: every stylesheet starts from the phone layout and adds the tablet and desktop artboard values in `min-width` media queries. On a phone the dashboard follows `design/Admin-Phone.dc.html`: a top bar with a menu button and a sticky **Publish changes** bar.

```
src/
  components/ui/         shared design pieces
  components/site/       website header, footer, door sign, Today’s Brew card
  components/dashboard/  dashboard shell, cards, form fields
  pages/site/            Home, Menu, 404
  pages/dashboard/       Today’s brew, Menu & prices, Photos, Hours & notices
  lib/                   data model, hours logic, formatting, photo storage
  store/                 draft/published store and persistence
```

## Prototype notes

Where the artboards and the brief disagreed, or left something open, this is what the prototype does:

- **Prices still to come show “[PRICE]”**, as in the artboards and `docs/CONTENT.md`. Every price in the seed is blank because none are confirmed yet. Before launch, set `SHOW_PRICE_PLACEHOLDERS` to `false` in `src/lib/format.ts`: a blank price then hides the price, as the brief specifies. The Today’s Brew card already hides a blank price.
- **A “Private events” sticker** joins “News & nice words”. The brief and the seed call for it, but the home artboard doesn’t show one, so it is drawn to match the other stickers.
- **A “For the owners” link in the footer** opens the dashboard. The artboards don’t have one. There is no login yet, so anyone can follow it, but they only change the copy saved in their own browser. Once there is a backend, it should lead to a login.
- **The phone dashboard keeps every field** (descriptions, the note, the photo of the day, the preview) below the ones the phone artboard shows, so the owners can do everything from their phones.
- **Small additions** the data model needed: a + / − beside each day’s hours to add or remove a midday break, opening times for special days that aren’t full closures, and a remove button in the photo library. New library uploads get the tag that is selected.
- **The menu shows “[Soft drinks]”-style rows** until the owners add their drinks, which `docs/CONTENT.md` lists as unknown.

### Still needed from the owners

From `docs/CONTENT.md`: every price, the owner names for the “Hi neighbour” letter, the rest of the sammie menu and the roast chicken toppings, drinks, photos (patio, crew, the Trucker, link preview), the original logo file, and a confirmed map pin.
