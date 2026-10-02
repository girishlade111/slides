# Lade Slides — Presentation Editor

A fully client-side slide presentation editor built with **Vite**, **React 18**, **TypeScript**, **Tailwind CSS** and **shadcn/ui**. Create, edit and export beautiful slide decks right in the browser — no account needed, no server round-trips.

## Features

- **Visual slide editor** — canvas-based editing powered by react-konva (drag, resize, align shapes and text)
- **Slide management** — slide list, thumbnails, reordering, duplicate/delete slides
- **Themes & backgrounds** — built-in theme gallery, theme editor, slide background editor
- **Master slide system** — master slides, master-slide editor, reusable layouts
- **Media** — image insertion, image properties panel
- **Animations & transitions** — animation panel and slide transition panel
- **Presenter tools** — presenter view with speaker notes (synced via Supabase) and an audience window
- **Export** — export decks to **PPTX** (pptxgenjs), **PDF** (jsPDF), and ZIP (jszip); html2canvas snapshots
- **UI** — full shadcn/ui component set, dark-mode ready (next-themes), toast notifications (sonner)

## Tech Stack

| Layer      | Tech                                                                 |
|------------|----------------------------------------------------------------------|
| Framework  | React 18, TypeScript, Vite 5                                         |
| Styling    | Tailwind CSS 3, shadcn/ui (Radix primitives), tailwindcss-animate     |
| Canvas     | react-konva, Konva, @react-three/fiber (3D extras)                   |
| State      | Zustand, TanStack React Query                                        |
| Forms      | react-hook-form + zod                                                |
| Notes sync | Supabase (optional — notes persistence only)                          |
| Charts     | Recharts, embla-carousel, react-day-picker                           |
| Export     | pptxgenjs, jsPDF, html2canvas, jszip, file-saver                      |

## Quick Start

```sh
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. (Optional) presenter-notes sync via Supabase — copy and fill in
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Run the dev server
npm run dev

# 4. Production build (served from /slides/ on GitHub Pages)
npm run build
```

Node.js 18+ recommended. Uses npm (a `package-lock.json` ships with the repo; `bun.lockb` is also present from the original Lovable scaffold).

## Project Structure

```
src/
├── App.tsx                 # router + providers
├── main.tsx                # entry
├── pages/                  # Index (editor), AudienceWindow, NotFound
├── components/
│   ├── slides/             # SlideEditor, SlideList, SlideView, PresenterView, ...
│   ├── ui/                 # shadcn/ui primitives
│   └── dialogs/            # ExportDialog, FileMenu, ...
├── slides/                 # demo + showcase decks
├── store/                  # zustand stores
├── hooks/                  # editor hooks (incl. usePresenterNotes)
├── integrations/supabase/  # Supabase client (presenter notes only)
├── lib/, data/, types/, assets/
public/                     # favicon, robots.txt
supabase/                   # migrations + edge functions (optional backend)
```

## Environment Variables

| Variable                        | Required | Purpose                                    |
|---------------------------------|----------|--------------------------------------------|
| `VITE_SUPABASE_URL`             | No       | Supabase project URL — presenter notes sync |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No       | Supabase anon key — presenter notes sync    |

Without these, the editor works fully locally; only presenter-note persistence is disabled.

## Deploy Notes

- Fully static — deploys anywhere (GitHub Pages, Cloudflare Pages, Netlify).
- GitHub Pages project site: build with base `/slides/` so asset URLs resolve:

  ```sh
  npx vite build --base=/slides/
  ```

  Publish the `dist/` output (e.g. to a `docs/` folder on `main` with a `.nojekyll` file and a `404.html` copy for client-side routing).
- The app uses `BrowserRouter`; on static hosts, copy `index.html` to `404.html` so deep routes still load.
- Deployment status: **live on GitHub Pages** — https://girishlade111.github.io/slides/

## Built by

Built by [Girish Lade](https://ladestack.in) — part of the [LadeStack](https://ladestack.in) open-source portfolio.
