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
  public/                  # Static assets (favicon, icons, sw.js)
  src/
    components/            # UI components
      common/              # Shared/Generic components (Save, Share, Views)
      features/            # Domain-specific components
      layout/              # Layout parts (Header, Footer, Router)
      ui/                  # Base UI kit (shadcn-based)
    contexts/              # Global state (Language, Theme)
    hooks/
      blog/                # Feature-specific hooks (Posts, Views)
    lib/                   # Utilities & data providers (data.ts, utils.ts)
    pages/
      blog/                # Blog-feature specific pages
    services/
      blog/                # External integrations (GitHub sync)
    types/                 # Centralized TS types
    App.tsx                # Main entry point & routing configuration
    main.tsx               # Client hydration
```
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

## Coding Standards & Policies

To maintain a clean and scalable codebase, especially for open-source contributors, please adhere to these standards. For a comprehensive list of all engineering policies, see the [Coding Standards & Engineering Policies](./coding-standards.md) document.

### Naming Conventions
- **Files & Directories**: Use `kebab-case` for general files and `PascalCase` for React components (e.g., `BlogItem.tsx`, `use-mobile.ts`).
- **Hooks**: Feature-specific hooks should be grouped in directories (e.g., `src/hooks/blog/Views.ts`).
- **Components**: Export components as `default` for pages and layout parts, or named exports for small utilities. Reference them by simple names (e.g., `Save.tsx` instead of `SaveButton.tsx`).

### State & Logic
- **Async Data**: Use `@tanstack/react-query` for all external data fetching. Logic should reside in custom hooks under `src/hooks/`.
- **Global UI State**: Use Context API sparingly for true global concerns like `Language` and `Theme`.
- **Reusable Logic**: Abstract complex logic into `services/` or `lib/` to keep components focused on rendering.

### Performance & PWA
- **Service Worker**: When modifying critical assets, bump the `CACHE_NAME` in `sw.js` to ensure users get the latest version.
- **Images**: Use responsive images or placeholders (like `placehold.co`) for demos. Prefer lightweight SVGs for icons.

### Tooling
- **TypeScript**: Avoid `any`. Use strict typing for all props and data models.
- **Linting**: Ensure there are no module resolution errors or unused imports.
- **Tailwind**: Use the `cn` utility for conditional classes to maintain readability.

### PR Rules & Policy
- **Feature Branches**: Never push directly to `main`. Create a branch with a descriptive name (`feat/view-counts`, `fix/mobile-padding`).
- **PR Description**: Include a clear summary of changes, why they were made, and link any relevant issues.
- **Screenshots**: Mandatory for UI changes. Show both Light and Dark modes if applicable.
- **Zero-Broke Policy**: Ensure the PWA manifest and Service Worker remain functional after changes.

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
