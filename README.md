# Nova

A visual website builder for the browser — drag blocks onto a canvas, style them
in an inspector, and export a real, dependency-free site as HTML or React.

Nova is a full editor, not a demo: 46 blocks, 24 starter templates, responsive
breakpoints, reusable components, undo/redo, a command palette, accounts,
one-click publishing, and form submissions collected in a real backend.

---

## Features

**Canvas & editing**
- Drag from the block palette onto the canvas with live drop indicators — the
  hit-test walks the rendered tree to find the deepest valid container and the
  exact insertion index (horizontal or vertical).
- Drag existing nodes to relocate them, from the canvas or the layers tree.
- Layers panel with a collapsible tree, select/hover sync, and per-node
  hide / duplicate / delete.
- Inspector for layout, spacing, typography, colour, borders, effects and
  per-block properties.
- Inline text editing directly on the canvas.
- Undo / redo across the whole document, plus autosave to local storage.
- Command palette (`⌘K`) for blocks, pages and actions.
- Right-click context menu, multi-page sites, and a section library.

**Blocks**
- 46 registered block types across layout, content, media, forms, interactive,
  social, tabs, counters and composite sections.
- Composite sections (navbar, hero, features, stats, logo cloud, testimonial,
  pricing, gallery, CTA, footer) drop in as fully styled, editable trees.
- Reusable components — turn a header or footer into an instance shared across
  every page; edit once, update everywhere.

**Design system**
- Theme panel with colour themes and curated font pairings applied
  document-wide.
- Custom font upload (`.woff2`, `.woff`, `.ttf`, `.otf`) — faces are embedded in
  the export, so published sites carry their own type.
- Responsive overrides per breakpoint: desktop, tablet and mobile.

**Templates**
24 complete multi-page starters, each with its own palette, type pairing and
navigation:

| | | |
|---|---|---|
| Aurora — SaaS | Horizon — SaaS | Noir — Agency |
| Folio — Portfolio | Pulse — Mobile app | Bloom — E-commerce |
| Gazette — Blog | Saffron — Restaurant | Haven — Real estate |
| Summit — Event | Forge — Fitness | Ledger — Fintech |
| Mediva — Medical | Scholar — Education | Wander — Travel |
| Vows — Wedding | Lumen — AI | Atelier — Luxury |
| Cobalt — Enterprise | Halo — Personal | Verdant — Nonprofit |
| Aperture — Photography | Cadence — Podcast | Monarch — Architecture |

**Export & publish**
- Download the current page as a single `.html` file.
- Download the whole site as a `.zip` — clean semantic HTML and scoped CSS, no
  runtime, no framework, no build step.
- Export to React (`.jsx`) components.
- Publish to a live URL at `/s/<slug>/` served straight from the backend.

**Backend**
- Email + password accounts (bcrypt hashes, JWT sessions).
- Projects saved to the cloud, listed and reopened from anywhere.
- Form blocks post to `/api/f/:projectId`; submissions are stored per project
  and readable from the editor.

---

## Getting started

**Requirements** — Node 18 or newer. `better-sqlite3` compiles a native module
on install, so macOS needs Xcode command line tools and Linux needs
`build-essential` and `python3`.

```bash
git clone https://github.com/<your-username>/nova.git
cd nova
npm install
```

Nova runs as two processes.

```bash
# terminal 1 — API + published sites, on :8787
npm run server

# terminal 2 — editor, on :5199
npm run dev
```

Open <http://localhost:5199>. Vite proxies `/api` and `/s/` through to the
backend, so a single origin works in development.

The editor is fully usable without the server — projects autosave locally.
The server is what adds accounts, cloud projects, publishing and form
submissions.

### Production build

```bash
npm run build     # type-check, then bundle to dist/
npm run preview   # serve the bundle locally
```

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8787` | Backend port |
| `NOVA_SECRET` | `nova-dev-secret-change-me` | JWT signing secret |

Set a real `NOVA_SECRET` before deploying anywhere public — the default is a
development placeholder, and anyone who knows it can mint valid sessions.

The backend keeps everything in a SQLite file at `server/nova.db`, created on
first run. It is gitignored; back it up if you care about the data in it.

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` | Command palette |
| `⌘Z` / `⇧⌘Z` | Undo / redo (`⌘Y` also redoes) |
| `⌘C` / `⌘X` / `⌘V` | Copy / cut / paste — works across pages |
| `⌘D` | Duplicate the selection |
| `⌥↑` / `⌥↓` | Move the selected node among its siblings |
| `Backspace` / `Delete` | Delete the selection |
| `Esc` | Clear the selection |

---

## Project layout

```
src/
  core/         document schema and the renderer shared by editor and export
  blocks/       block definitions — one module per family, self-registering
  editor/       editor UI: canvas, inspector, panels, modals, top bar
  dnd/          drag-and-drop context and pointer hit-testing
  store/        zustand stores for the document (with undo) and auth
  templates/    the 24 starters, the section library and the styling kit
  theme/        colour themes, font pairings, custom font handling
  export/       HTML and React emitters
  api/          typed client for the backend
server/
  index.mjs     Express API, SQLite storage, published-site hosting
```

A block is a single self-contained definition — a `type`, an icon, default
props and styles, and a render function. Registering one is an import away, so
adding a block means writing one file and listing it in `src/blocks/index.ts`.

---

## Tech

React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · zustand + zundo · @dnd-kit ·
Express 5 · better-sqlite3 · lucide-react · JSZip

---

## License

MIT — see [LICENSE](LICENSE).
