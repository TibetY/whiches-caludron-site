# Design system: ’Wiches Cauldron

The look copies the shop’s own logo sticker: purple swirls, aqua ribbon banners, bubbly purple lettering with dark cartoon outlines, a bubbling green cauldron and flames, and white die-cut sticker edges. It should stay cozy and hand-made, never techy.

## Colour tokens
```css
:root {
  /* ink and paper */
  --ink: #26121F;            /* all text and outlines */
  --cream: #FCF6EC;          /* page background, tiled with assets/cream-paper.jpg (512px) */
  --white: #FFFFFF;          /* sticker cards and the die-cut sticker margin */
  --text-2: #5A3550;         /* secondary text */
  --text-3: #6B4A61;         /* helper text (passes 4.5:1 on white and cream) */

  /* purples */
  --purple: #9E4C92;         /* headings, primary buttons (from the logo lettering) */
  --purple-deep: #5E2159;    /* hero, sticker wall and footer bands; dashboard sidebar */
  --purple-awning: #A13C9B;  /* awning stripes */
  --orchid: #C56CB0;         /* blobs, dotted leaders, holiday sticker */
  --orchid-light: #D38FC3;
  --lavender: #F3E1EF;       /* menu page backdrop */
  --swirl-1: #6A2564; --swirl-2: #742B6E; --swirl-3: #7E3178; --swirl-ring: #8E3A88;  /* swirls on purple-deep */

  /* aquas */
  --aqua: #83EDF8;           /* ribbon bands, secondary buttons, highlights */
  --teal: #2EC4CE;           /* ribbon tails, bowl */
  --aqua-pale: #DDF6F8;      /* Trucker band, map and crew placeholders */

  /* potion, fire, bread */
  --lime: #B8E06A; --potion: #8CC63F; --leaf: #4E8A1E;
  --flame: #E32B2C; --flame-orange: #F7941D; --flame-yellow: #FFD23F;
  --toast: #FED292; --crust: #E0A85C;
  --grey-pot: #ACA7A1; --grey-pot-dark: #8C8782;

  /* status */
  --open: #3F7A17; --closed: #C42222;
  --ok-bg: #D9F2B3; --warn-bg: #FFE7A8; --warn-dot: #F7941D;
  --focus: #2EC4CE;
}
```

## Type
- **Chewy** (Google Fonts): display. Use it for headings, the wordmark "’wiches cauldron" (lowercase, like the logo), buttons, sticker titles and menu item names.
- **Literata**: body text on the public site, at 17–21px.
- **Caveat**: handwritten asides, a few per section at most ("you’ll want napkins for this one —").
- **Nunito**: dashboard UI text, labels and inputs.

Load them with one link:
`https://fonts.googleapis.com/css2?family=Chewy&family=Caveat:wght@400..700&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&family=Nunito:ital,wght@0,400..900;1,400..900&display=swap`

## Signature recipes

**Outlined lettering**, like the logo's. Use a coloured fill with an ink outline plus a drop:
```css
.outlined-2 { text-shadow: 2px 0 0 var(--ink), -2px 0 0 var(--ink), 0 2px 0 var(--ink), 0 -2px 0 var(--ink),
  1.5px 1.5px 0 var(--ink), -1.5px -1.5px 0 var(--ink), 1.5px -1.5px 0 var(--ink), -1.5px 1.5px 0 var(--ink), 3px 4px 0 var(--ink); }
.outlined-3 { /* hero and big titles */ text-shadow: 3px 0 0 var(--ink), -3px 0 0 var(--ink), 0 3px 0 var(--ink), 0 -3px 0 var(--ink),
  2.2px 2.2px 0 var(--ink), -2.2px -2.2px 0 var(--ink), 2.2px -2.2px 0 var(--ink), -2.2px 2.2px 0 var(--ink), 5px 6px 0 var(--ink); }
```
Headings use purple on cream, and cream with the aqua accent word on purple-deep.

**Sticker card**:
```css
.sticker { background: #fff; border: 3px solid var(--ink); border-radius: 24px;
  box-shadow: 0 0 0 10px #fff, 0 16px 26px 8px rgba(38,18,31,.22); }
```
Give stickers a slight tilt with `transform: rotate(...)`, between -3° and 3°. Coloured stickers (aqua, orchid, lime, cream) keep the white margin. Dashboard cards don't tilt: they use `border: 3px solid ink; border-radius: 20px; box-shadow: 0 4px 0 ink`.

**Cartoon button**: `border: 3px solid ink; border-radius: 16px; box-shadow: 0 5px 0 ink`, Chewy at 22–27px, minimum 48px tall.
- Primary: purple with cream text.
- Secondary: aqua with ink text.
- Tertiary: cream with ink text.

**Ribbon heading**: an aqua band with a 3px ink border, and teal notched tails tucked behind each end, 12–22px lower than the band.
- The tails are an SVG with `preserveAspectRatio="none"` and `vector-effect="non-scaling-stroke"`. Paths:
  - Left tail: `M70 1.5 L3 1.5 L20 30 L3 58.5 L70 58.5 Z`
  - Right tail: `M0 1.5 L67 1.5 L50 30 L67 58.5 L0 58.5 Z`
- Put the tails at `z-index: -1` inside an `isolation: isolate` wrapper.

**Awning** across the top of every public page:
- Stripes: `repeating-linear-gradient(90deg, var(--purple-awning) 0 48px, var(--cream) 48px 96px)`, 50px tall, with a 3px ink bottom border.
- Under it, an SVG pattern of scallops, 96×26 per tile: a purple scallop then a cream one, each outlined in ink.

**Swirl bands**: the hero, the "News & nice words" sticker wall and the footer.
- A `--purple-deep` background with `assets/svg/swirl-band.svg` covering it (`preserveAspectRatio="xMidYMid slice"`). Mirror it with `scaleX(-1)` for variety.
- The menu page uses `assets/svg/swirl-band-light.svg` on `--lavender`.

**Wave dividers**: 60px tall, with an ink line along the wave. They join the swirl and aqua bands to the cream sections. See `assets/svg/wave-cream-above.svg` and `wave-cream-below.svg`. Recolour the fill to whatever the neighbouring section is.

**Dotted leaders** in menu lists: an empty flex span with `border-bottom: 3px dotted var(--orchid)`, sitting between the item name and its price on the text baseline.

## Illustrations (assets/svg)
- `cauldron.svg`: the Today's Brew cauldron.
- `trucker-exploded.svg`: the Trucker with labelled layers. The labels use Chewy.
- `soup-bowl.svg`
- `butter-tart.svg`

All drawings are flat cartoon style with ink outlines 3–5px wide. Add any new drawings in the same style.

## Logo
`assets/logo-sticker.webp` is the shop’s real logo, cut out as a die-cut sticker. Show it at 360px or smaller: the source is low-resolution (225px), and we're waiting on the original file. **Do not redraw it.** Add a slight tilt and a drop shadow.

## Copy voice
Warm, neighbourly, Canadian spelling (neighbour, favourite), short sentences. Their own words: "sammie(s)", "’wich", "Today’s Brew", "by the till".
