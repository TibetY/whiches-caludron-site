# Design reference

These are the approved artboards, exported from the design canvas. You can view the canvas at
https://claude.ai/artifact/LDDw3kejP53LZjpeyfuz4y. It's private to its owner unless they share it.

| File | What it is | Route |
|---|---|---|
| `Main.dc.html` | Public home page | `/` |
| `Menu.dc.html` | Public menu page | `/menu` |
| `Admin-Today.dc.html` | Dashboard: Today’s brew (desktop) | `/dashboard` |
| `Admin-Phone.dc.html` | Dashboard: Today’s brew on a phone (390×844) | `/dashboard`, responsive |
| `Admin-Menu.dc.html` | Dashboard: Menu & prices | `/dashboard/menu` |
| `Admin-Photos.dc.html` | Dashboard: Photos | `/dashboard/photos` |
| `Admin-Hours.dc.html` | Dashboard: Hours & notices | `/dashboard/hours` |
| `canvas.json` | Canvas layout (frame sizes) | n/a |

## How to read a `.dc.html` file
These are "Design Component" pages: plain HTML with **inline styles**. Take the exact values (colours, sizes, radii, shadows, spacing) straight from the `style` attributes.

- The visible markup is everything inside `<x-dc>…</x-dc>`. `<helmet>` holds the font links and a few base CSS rules.
- `{{name}}` is a value filled in by the `renderVals()` method of the `class Component` in the `<script type="text/x-dc">` block at the bottom.
  - That script is also a working reference for the dashboard behaviour: field handlers, switches, chips, publish, the door-sign logic and the photo picking.
- `<sc-if value="{{cond}}">` renders its content only when the condition is true.
- `<sc-for list="{{items}}" as="item">` repeats its content for each item.
- `<script src="./support.js">` is the canvas runtime. Ignore it.
- `/_blob/…` URLs are uploaded assets. Map them like this:
  - `/_blob/3f6d1ae5a323ef01495b7d89532b01dd` → `assets/logo-sticker.webp`
  - `/_blob/860f97b01752ad1d29fee55a04c27b38` → `assets/cream-paper.jpg`
- Big inline `<svg>`s are illustrations and decoration. The reusable ones are also exported as standalone files in `assets/svg/`.
- `[PRICE]`, `[Owner names]` and similar markers are deliberate placeholders. Keep them visible; see `docs/CONTENT.md`.
