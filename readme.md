# Wrong Ones

Landing site for **Wrong Ones** — a community awareness app for browsing and reporting incidents in your area.

Built with **Vite**, **TypeScript**, **Handlebars**, and **SCSS**.

## Pages

| Page | Path |
|------|------|
| Home | `src/index.html` |
| Waitlist confirmation | `src/confirmation.html` |
| Privacy Policy | `src/privacy.html` |
| Terms of Use | `src/terms.html` |

Home sections: hero, connects, purpose, how it works, design (privacy), features, build, FAQ, coming (waitlist form), footer.

## Requirements

- Node.js 18+ (LTS recommended)
- npm

## Setup

```sh
npm install
npm run dev
```

Dev server uses `src` as root, opens the browser, and reloads on template / section / script changes.

```sh
npm run build    # output → dist/
npm run preview  # preview production build
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview `dist` locally |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run webp` | Convert images in `public/` to WebP |
| `npm run webp:watch` | Watch and convert images |

Disable WebP conversion (e.g. CI):

```sh
VITE_WEBP_CONVERT=false npm run build
```

## Project structure

```text
.
├─ src/
│  ├─ index.html              # Main landing
│  ├─ confirmation.html       # Post-waitlist success
│  ├─ privacy.html            # Privacy Policy
│  ├─ terms.html              # Terms of Use
│  ├─ templates/              # Shared partials (header, footer)
│  ├─ sections/               # Page sections
│  ├─ styles/                 # SCSS (base + layout)
│  └─ ts/main.ts              # Burger, waitlist form, scroll
├─ public/images/             # Static images (PNG → WebP)
├─ scripts/
│  ├─ convertToWebp.ts
│  └─ pictureHelper.ts
├─ getHTMLFileNames.ts
├─ vite.config.ts
└─ package.json
```

## Handlebars helpers

Configured in `vite.config.ts`:

- **`picture`** — `<picture>` with WebP + fallback, optional responsive `sources`
- **`array`** / **`object`** — build `sources` for art-direction

```hbs
{{picture "/images/logo.png" alt="Wrong Ones" width="210" height="40"
  sources=(array
    (object media="(max-width: 768px)" srcset="/images/logo-mob.png")
  )
}}
```

Partials live in `src/templates` and `src/sections`. Include them with `{{> header }}`, `{{> section-hero }}`, etc.

## Styles

- SCSS only (`src/styles`)
- Breakpoints via `include-media`: `phone` (480), `tablet` (768), `desktop` (1024)
- Layout partials map to sections (`_hero.scss`, `_faq.scss`, …)

## Navigation notes

Menu and waitlist CTAs use `./index.html#…` so links work from Privacy / Terms / Confirmation pages as well as the home page.

## Deploy (GitHub Pages)

`vite.config.ts` sets `base: './'`, so the build works from a repo subpath.

1. `npm run build`
2. Publish the contents of `dist/` (e.g. `gh-pages` branch or Actions)

## License

Private project — Wrong Ones.
