# Sahb — Bilingual Developer Blog Template

Sahb is a modern, clean, bilingual (Arabic RTL / English LTR) blog template for developers, built with React + TypeScript and powered by Vite. It’s content‑first, fast, and SEO‑friendly — inspired by the elegance of Pixyll but tailored for bilingual publishing and dev‑friendly customization.

---

## Highlights

- Bilingual UX: Arabic RTL and English LTR with instant language switch
- Dark/Light Theme: system-aware with a manual toggle
- Blazing Fast: Vite, Tailwind CSS, code-splitting, minimal JS
- Content-First: crisp typography and focused reading experience
- SEO-Ready: `react-helmet-async` meta tags and clean routes
- Markdown Pages: drop `.md` files and route them instantly
- Achievements Bar: auto-scrolling showcase in the footer
- support Comments && Reaction features 🚨
- support multi language
- sync/import github repo
- **GUI** data center mangment applcation

---

## Why Sahb?

- Built for bilingual devs and teams that need RTL and LTR out of the box
- Minimum setup: change one JSON file and you’re live
- Portable: static output in `dist/public` for any host (Pages, Netlify, Vercel, S3)
- Developer‑friendly: small codebase, clear structure, familiar tools

---

## Quick Start

```
git clone https://github.com/ShulkwiSEC/shulkwisec.github.io.git
cd shulkwisec.github.io
npm install
npm run dev
```

Open the printed localhost URL (Vite default ~5173), toggle language/theme, and start editing content in `client/src/data/template.json` and Markdown files in `client/src/data/`.

---

## Content Model

- `client/src/data/template.json` is your control center:
  - `site`: title, subtitle, description (ar/en), external links to Markdown pages, and swipeable routes
  - `owner`: profile + social links
  - `about`: headings, body, skills, contact links
  - `achievements`: title/subtitle/banner/fallback link per item
  - `blog.posts`: array of posts (id, date, bilingual title/excerpt, content, banner, tags)

Blog `content` supports Base64 (default) or plain Markdown via `encoding: false`.

Markdown pages live in `client/src/data/*.md` and are routed as `/page/<slug>`.

---

## Deployment (GitHub Pages)

- For user/organization pages (e.g., `username.github.io`): keep `base: '/'` in `vite.config.github.ts`.
- For project pages (e.g., `username.github.io/my-blog`): set `base: '/my-blog/'`.
- Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys `dist/public` automatically.

---

## Tech Stack

- React 18 + TypeScript
- Vite 5, Tailwind CSS, shadcn/ui
- Wouter (tiny router), react-helmet-async (SEO)
- highlight.js (code), swiper (achievements bar)

---

## Who Is It For?

- Developers, freelancers, and teams writing bilingual technical posts
- Portfolios with a blend of posts + static pages (Resume, Vision, Experience)

---

## License

MIT — free to use, modify, and ship.
If you enjoy Sahb, consider giving the repo a star and sharing feedback or PRs!