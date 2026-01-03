# Coding Standards & Engineering Policies

This document outlines the engineering principles and coding standards for the Sahb project. All contributors are expected to follow these guidelines to ensure consistency, readability, and maintainability.

---

## 🏗️ Architecture Principles

1. **Simplicity Over Complexity**: If a task can be solved with vanilla CSS or simple React state, do not reach for a library. Use minimalist tools like `wouter` and `lucide-react`.
2. **Modular Components**: Components should be "highly cohesive and loosely coupled." If a component exceeds 200 lines, it's likely time to split it.
3. **Feature-Based Organization**: Group logic (hooks/services) by feature (e.g., `blog`, `theme`) rather than by type alone.
4. **Data-Driven UI**: The primary source of truth for all content must be `template.json`. Components should be built to consume this data dynamically.

---

## 📁 File & Directory Naming

- **React Components**: `PascalCase` (e.g., `BlogItem.tsx`, `Header.tsx`).
- **Hooks**: `kebab-case` with `use` prefix (e.g., `use-post-views.ts`).
- **Styles & Scripts**: `kebab-case` (e.g., `main.tsx`, `index.css`).
- **Directory Structure**: Logical grouping is preferred.
  - `src/components/common/`: UI elements like buttons and icons.
  - `src/components/features/`: Feature-specific UI logic.

---

## 🎨 Styling (Tailwind CSS)

- **Avoid Ad-hoc Values**: Use Tailwind's spacing and color tokens. If a specific hex code is needed, add it to `tailwind.config.ts`.
- **Conditional Classes**: Always use the `cn()` utility (`clsx` + `tailwind-merge`) for conditional class joining.
- **RTL Support**: Use logical properties like `s-` (start) and `e-` (end) or utility prefixes like `rtl:ml-2` to ensure the UI looks great in both Arabic and English.

---

## ⚛️ React & TypeScript

- **Strict Typing**: No `any`. Use interfaces for component props and type aliases for data shapes.
- **Functional Components**: Use arrow functions or function declarations consistently.
- **Hooks Order**: Adhere strictly to the Rules of Hooks. Never call hooks conditionally.
- **Async Logic**: Fetching must be handled by `@tanstack/react-query`. Do not use `useEffect` for data fetching unless React Query is unsuitable.

---

## 🌍 Localization & PWA

- **Bilingual Strings**: Labels should be added to `src/contexts/Language.tsx` and consumed via the `t()` function.
- **Dynamic Direction**: Components must respect the `dir` (RTL/LTR) context. Avoid hardcoded `left`/`right` properties in CSS/Tailwind.
- **Service Worker**: Bump the version in `sw.js` (`CACHE_NAME`) whenever critical assets or folder structures are renamed to prevent stale cache bugs.

---

## ✅ Pull Request Policy

1. **Self-Review**: Before opening a PR, run the build locally (`npm run build`) and check for linting errors.
2. **Visual Evidence**: Any UI change must include screenshots for both **Light** and **Dark** modes.
3. **PWA Integrity**: Verify that `manifest.json` and the Service Worker are still functional (Check Chrome DevTools > Application tab).
4. **Atomic Commits**: Commits should be small and focused on a single logical change.

---

## 🛡️ Security Best Practices

- **Sanitization**: All user-generated or fetched Markdown content must be sanitized using `DOMPurify` before rendering.
- **Secrets**: Never commit API keys or sensitive tokens. Use environment variables if needed.
