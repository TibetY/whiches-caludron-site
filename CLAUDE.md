# ’Wiches Cauldron: website + shop dashboard (React prototype)

Front-end prototype for **’Wiches Cauldron Sandwich Shoppe**, 2006 Carp Road, Carp (Ottawa), Ontario:

- a public **website** (Home, Menu)
- an owner **dashboard** for updating today’s soup and sammie, what’s by the till, menu and prices, photos, hours and notices.

**No backend yet.** All content lives in a local store that is persisted to `localStorage`. It keeps a *draft* copy and a *published* copy. Uploaded photos are stored in IndexedDB. Pressing **Publish changes** in the dashboard copies the draft into the published copy, and the public pages always read the published copy.

## Read first
- `docs/BRIEF.md`: what to build, including routes, data model, behaviours, build phases and acceptance criteria.
- `docs/DESIGN.md`: design tokens and the signature shapes (stickers, ribbons, swirls, waves, outlined lettering).
- `docs/CONTENT.md`: which facts are verified and which are placeholders. **Never invent prices, names or facts.**
- `content/seed.json`: starting content, in the shape of the data model.
- `design/`: the approved designs as HTML artboards. `design/README.md` explains how to read them.
- `assets/`: the logo, the paper texture and ready-made SVG illustrations.

## Stack and commands
- Vite, React 18 and TypeScript, with React Router.
- CSS Modules plus CSS custom properties. Put the tokens in `src/styles/tokens.css`.
- Vitest with React Testing Library; ESLint with `jsx-a11y`; Prettier.
- Set these scripts up in phase 1: `npm run dev`, `npm run build`, `npm test`, `npm run lint`.

## Rules
- Match the design artboards closely. Don't restyle into a generic look: no gradient washes, no emoji, no generic SaaS cards.
- Keep `[PLACEHOLDER]`-style markers for anything unknown (prices, owner names, photos).
- Accessibility:
  - Use real `<button>`, `<a>` and `<label>` elements.
  - Toggles use `role="switch"` and chips use `aria-pressed`.
  - Show a visible focus ring: 3px `#2EC4CE`.
  - Text contrast must be at least 4.5:1.
  - Every photo has alt text.
- Time logic (the door sign and anything that says "open now") uses **America/Toronto**. On Fridays they close from 2:30 to 4:30.
  - Keep this logic as a pure function in `src/lib/hours.ts`, covered by unit tests.
- Shared visual pieces go in `src/components/ui/`: `StickerCard`, `Ribbon`, `OutlinedHeading`, `CartoonButton`, `Switch`, `Chip`, `SwirlBand`, `WaveDivider`, `Awning`.
- Don’t redraw the logo. Use `assets/logo-sticker.webp`. A higher-resolution original is still to come from the owner.
