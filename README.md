# سحب (Sahb) - Bilingual Developer Blog Template

"سحب" (Sahb) is a modern, clean, and minimal bilingual developer blog template built with React and TypeScript. It's designed to be content-first, inspired by Pixyll's philosophy, and provides a seamless experience for both Arabic (RTL) and English languages. Sahb aims to offer a fast, optimized, and SEO-friendly platform for developers to share their knowledge and experiences.

## Features

- 🌐 **Bilingual Support**: Full Arabic (RTL) and English language support, easily switchable.
- 🌓 **Dark/Light Theme**: Automatic system preference detection with a manual toggle for user preference.
- 📱 **Fully Responsive**: Mobile-first design ensuring a great experience on all devices.
- ⚡ **Fast & Optimized**: Built with Vite for lightning-fast development and production builds, focusing on performance.
- 🎨 **Clean Design**: Minimalist, typography-focused design for an enjoyable reading experience.
- 🔍 **SEO Optimized**: Proper meta tags and Open Graph support for better search engine visibility.
- 🚀 **Achievements Footer Bar**: A dynamic, auto-scrolling bar in the footer to showcase your latest achievements or projects.

## Quick Start

### Local Development

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/SaaSPortfolioBlog.git
    cd SaaSPortfolioBlog
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:5000` in your browser to see your blog.

### Deployment

#### Deploying to GitHub Pages

This template is configured for easy deployment to GitHub Pages using GitHub Actions.

1.  **Update `vite.config.github.ts`**:
    If you are deploying to a project page (e.g., `your-username.github.io/your-repo-name/`), you need to update the `base` path in `vite.config.github.ts`.
    ```typescript
    // vite.config.github.ts
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import path from "path";

    export default defineConfig({
      base: "/your-repo-name/", // <--- Change this to your repository name
      plugins: [react()],
      root: path.resolve(__dirname, "client"),
      build: {
        outDir: path.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
      },
    });
    ```
    If you are deploying to a user or organization page (e.g., `your-username.github.io`), you can leave `base: '/'`.

2.  **Push your code to GitHub**:
    Ensure your project is pushed to a GitHub repository.

3.  **Enable GitHub Pages**:
    Go to your GitHub repository settings, navigate to the "Pages" section, and ensure GitHub Pages is enabled for the `gh-pages` branch (which will be created by the GitHub Action).

4.  **Automatic Deployment**:
    The `.github/workflows/deploy.yml` GitHub Action will automatically build your project and deploy it to the `gh-pages` branch whenever you push changes to your `main` (or default) branch.

#### Manual Build for Static Hosting

To build your project for deployment to any static hosting service (e.g., Netlify, Vercel, AWS S3):

```bash
npm run build
```
The built files will be located in the `dist/public` folder, ready to be uploaded to your hosting provider.

## Configuration

### `template.json` File

The `client/src/data/template.json` file serves as a central configuration hub for your blog's static content. It's used to define global site metadata, owner information, and achievements.

*   **`site`**: Contains general site information such as `title`, `subtitle`, and `description` in both Arabic (`ar`) and English (`en`).
*   **`owner`**: Details about the blog owner, including `name`, `bio`, `email`, and social media links (`github`, `twitter`, `linkedin`).
*   **`achievements`**: An array of objects, each representing an achievement to be displayed in the footer bar. Each achievement can have a `title`, `subtitle`, `banner` image (optional), and a `fallback` URL.

Example structure:
```json
{
  "site": {
    "title": { "ar": "سحب", "en": "Sahb" },
    "subtitle": { "ar": "مدونة تطويرية حديثة", "en": "Modern Developer Blog" },
    "description": { "ar": "مدونة تقنية ثنائية اللغة لمشاركة المعرفة والخبرات في تطوير الويب", "en": "Bilingual technical blog for sharing web development knowledge and experiences" }
  },
  "owner": {
    "name": { "ar": "محمد", "en": "Mohammed" },
    "bio": { "ar": "مطور ويب متخصص في بناء تطبيقات حديثة", "en": "Web developer specialized in building modern applications" },
    "email": "contact@sahb.blog",
    "social": {
      "github": "https://github.com/yourusername",
      "twitter": "https://twitter.com/yourusername",
      "linkedin": "https://linkedin.com/in/yourusername"
    }
  },
  "achievements": [
    {
      "title": "Achievement 1",
      "subtitle": "Subtitle for Achievement 1",
      "banner": "https://example.com/banner1.png",
      "fallback": "https://example.com/project1"
    },
    {
      "title": "Achievement 2",
      "subtitle": "Subtitle for Achievement 2",
      "fallback": "https://example.com/project2"
    }
  ]
}
```

### Adding Blog Posts

Edit `client/src/data/blogPosts.ts` to add or modify blog posts. Each post is an object with `id`, `date`, `title`, `excerpt`, `content` (in markdown-like format), and `tags`.

```typescript
// client/src/data/blogPosts.ts
export const posts = [
  {
    id: 'your-post-slug',
    date: 'January 1, 2025',
    title: 'Your Post Title',
    excerpt: 'A brief description of your post...',
    content: `
# Your Post Title

Your full content here in markdown-like format...
  `,
    tags: ['React', 'TypeScript'],
  },
  // Add more posts here
];
```

### Customization

1.  **Site Title & Subtitle**: Modify the `site` object in `client/src/data/template.json`.
2.  **About Page**: Edit `client/src/pages/About.tsx`.
3.  **Social Links**: Update the `owner.social` object in `client/src/data/template.json`.
4.  **Colors**: Modify `client/src/index.css` for custom theme colors and Tailwind CSS configuration in `tailwind.config.ts`.

## Project Structure

```
.
├── .github/workflows/     # GitHub Actions for deployment
├── client/
│   ├── public/            # Static assets (e.g., favicon, icons)
│   ├── src/
│   │   ├── components/     # Reusable React components (e.g., BlogCard, Navigation)
│   │   ├── contexts/       # React Contexts (e.g., LanguageContext, ThemeContext)
│   │   ├── data/           # Data files (e.g., blogPosts.ts, template.json)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions (e.g., utils.ts)
│   │   ├── pages/          # Page components (e.g., About.tsx, BlogPost.tsx)
│   │   ├── App.tsx         # Main application component
│   │   ├── index.css       # Global styles (Tailwind CSS imports, custom CSS)
│   │   └── main.tsx        # Entry point for the React application
│   └── index.html         # Main HTML template
├── dist/                  # Output directory for production builds
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration for local development
└── vite.config.github.ts  # Vite configuration for GitHub Pages deployment
```

## Technologies

-   **React 18** - A JavaScript library for building user interfaces.
-   **TypeScript** - A typed superset of JavaScript that compiles to plain JavaScript.
-   **Vite** - A fast build tool that provides an extremely quick development experience.
-   **Tailwind CSS** - A utility-first CSS framework for rapidly building custom designs.
-   **Swiper** - Modern touch slider with hardware accelerated transitions.
-   **Wouter** - A tiny (1KB) router for React.
-   **Lucide React** - A beautiful collection of open-source icons.

## Content Guidelines

### Markdown-like Syntax Support

The blog supports a simple markdown-like syntax for post content:

-   `# Heading 1`, `## Heading 2`, `### Heading 3`
-   `**bold**` for bold text
-   `*italic*` for italic text
-   `` `code` `` for inline code
-   ````
    ```language
    // Code blocks
    function hello() {
      console.log("World!");
    }
    ```
    ````
-   `- item` for unordered lists
-   `1. item` for ordered lists
-   `[text](url)` for links

## License

MIT