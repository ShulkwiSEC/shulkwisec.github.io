# Developer Guide & Contributing

Welcome to Sahb’s codebase. This document explains how the project is organized, how to develop locally, code patterns to follow, and how to contribute changes.

---

## Local Development

- Requirements: Node 18+ (recommended 20), npm 9+
- Install: `npm install`
- Run: `npm run dev` (Vite starts on a local port, typically 5173)

Build for production: `npm run build` (outputs to `dist/public`).

---

## Repo Structure

```
client/
  public/                  # Static assets (favicon, icons, 404.html)
  src/
    components/            # UI components (+ shadcn/ui kit)
    contexts/              # LanguageContext (RTL/LTR) & ThemeContext (light/dark)
    data/                  # template.json + Markdown pages (*.md)
    hooks/                 # Custom hooks (use-mobile, use-toast, ...)
    lib/                   # Utilities (queryClient, utils)
    pages/                 # Route views (SimpleBlog, BlogPost, About, MarkdownPage, NotFound)
    App.tsx                # Providers + Router + Head
    main.tsx, index.css    # Entrypoints/styles
vite.config.ts             # Dev build config
vite.config.github.ts      # GitHub Pages build config
tailwind.config.ts         # Tailwind theme/tokens
postcss.config.js          # PostCSS
.github/workflows/deploy.yml# CI for GitHub Pages
```

Routing uses Wouter with a thin `SwipeableRouter` wrapper to support left/right swipes and arrow keys across the pages declared in `site.swipeableRoutes`.

---

## Content Model (template.json)

Centralized configuration at `client/src/data/template.json`:

- `site`: bilingual title/subtitle/description, external links to Markdown pages (`/page/<slug>`), and `swipeableRoutes` to control gesture navigation order.
- `owner`: profile + `social` links.
- `about`: bilingual headings + text, skills, and contact links for the About page.
- `achievements`: items for the footer slider (title/subtitle/banner/fallback link).
- `blog.posts`: post objects consumed by `client/src/data/blogPosts.ts`.

Posts are mapped as:

```ts
export const blogPosts: BlogPost[] = templateData.blog.posts.map(post => ({
  id: post.id,
  date: post.date,
  title: post.title.ar + ' | ' + post.title.en,
  excerpt: post.excerpt.ar,
  content: decodeContent(post.content, post.encoding),
  banner: post.banner,
  tags: post.tags,
  encoding: post.encoding
}))
```

`decodeContent` treats content as Base64 unless `encoding === false`. Use `encoding: false` when providing plain Markdown.

---

## UI & Styling

- Tailwind CSS with custom CSS variables (see `tailwind.config.ts` and `client/src/index.css`).
- shadcn/ui components live under `client/src/components/ui/*` and are used throughout for consistency.
- Typography for content uses `prose` classes; code highlighting via `highlight.js` with a copy button injected for each `pre code` block.

---

## Language & Theme

- LanguageContext sets `html[lang]` and `dir` and persists preference to localStorage. Toggle via the globe button in the header.
- ThemeContext toggles `light`/`dark` classes on `<html>` and persists preference. Toggle via sun/moon button in the header.

---

## SEO

`client/src/components/Head.tsx` sets per‑language `<title>` and description meta using `react-helmet-async`. Extend as needed (e.g., `og:image`, `twitter:card`).

---

## Coding Guidelines

- Keep components small and focused.
- Co-locate component styles using Tailwind utility classes; avoid inline styles unless necessary.
- Prefer TypeScript types/interfaces at component boundaries.
- Keep bilingual strings in `template.json` where possible. For UI labels used across pages, add keys to `LanguageContext` if needed.
- Follow existing import aliases: `@` → `client/src`, `@shared`, `@assets`.

---

## Testing & QA

This repository doesn’t include automated tests yet. For changes:

- Validate local dev works across both languages and both themes.
- Verify code block highlighting and copy buttons.
- Check GitHub Pages build locally: `npm run build` and inspect `dist/public`.

---

## Deployment

- For user/org pages (e.g., `username.github.io`): keep `base: '/'` in `vite.config.github.ts`.
- For project pages (e.g., `username.github.io/my-blog`): set `base: '/my-blog/'`.
- CI deploys from `./dist/public` via `.github/workflows/deploy.yml` when pushing to `main`.

---

## Contributing

1) Fork → create a feature branch → implement changes
2) Keep patches focused and scoped; update docs if behavior changes
3) Open a PR with a clear description and screenshots (if UI)
4) Verify bilingual UX (RTL/LTR) and theme toggle still function

Issues and feature ideas are welcome. Thanks for contributing!
