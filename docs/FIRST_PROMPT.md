# First prompt for Claude Code

Open this folder in Claude Code (run `claude` inside it), then paste:

---

Read CLAUDE.md, then docs/BRIEF.md, docs/DESIGN.md and docs/CONTENT.md. Skim design/README.md so you know how to read the artboards in design/.

We're building the ’Wiches Cauldron website and shop dashboard as a React prototype with **no backend**: a local store saved to localStorage (draft + published), and photos in IndexedDB.

Start with **phase 1 and phase 2** from the brief:
1. Scaffold a Vite + React + TypeScript app in this folder, with React Router, CSS Modules plus tokens, Vitest, ESLint and Prettier.
2. Build the shared UI pieces: `StickerCard`, `Ribbon`, `OutlinedHeading`, `CartoonButton`, `Switch`, `Chip`, `SwirlBand`, `WaveDivider`, `Awning`.
3. Build the public Home (`/`) and Menu (`/menu`) pages so they match `design/Main.dc.html` and `design/Menu.dc.html`.
   - Use the files in `assets/` and the seed data from `content/seed.json`.
   - The store is read-only for now.

Before writing code, give me a short plan and the folder structure. When phase 2 is done, run the build, tests and lint, then stop and tell me how to view it.

---

Then continue phase by phase:
- "Do phase 3: the store, publishing, the door-sign logic with tests, and the /dashboard Today’s brew page with its live preview."
- "Do phase 4: Menu & prices, Photos, and Hours & notices, wired to the store."
- "Do phase 5: polish, the accessibility pass, Reset demo data, and a README."
