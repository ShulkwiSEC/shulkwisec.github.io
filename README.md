![سحب](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABqUlEQVR4AeyUvUtCURjGH6VP6Q9oknTzIxrDwaYQGnJ0CFxcRQqxXUc/UAhcpMkKHJsEdTXJRahFAofEhNLBMBTxs3OOXjE7JYIhxDnc95z3PPd97/ndh8uVD5Y85FjyEADCAeGAcEA4MJcD2WSS/bg/ajXcJxJIxWJ4yuWY9tv0nM+D9vBquAAvhQI67fa3+mu/n2nVchk0ZHI54tEornw+ptNJgmw1GvDZ7VRCNpXCYybD8umJC3DhcnEBpGa1Xo9jmw2HFgvOQiFIh9L7N4EAXdAfDPBerbJ8W6nEa7HI8umJC9BqNqHY2pqu5e5lMhlAA1/HoN8nMrlH5JXV1R9fiAug0ulwG4ngrVRCrVIZBnmbbrc7zCVttPY6nbHeG9XQb6NPIGh/o14nGPyLC+DwerG+uYkYsffS4wELtxtqrXaYS9poVRNgVkP2OxoNq7mLx7FrMLD8IZ2GivTyELgAK2trOLJacRoMYs9oxHk4PHc4yId54nSO+/ZNJt754AJMVm4oFJPbheczAQ7M5oUfOvnAmQCTxX+RCwDhgHBAOPD/HZj19/wEAAD//w44Lr4AAAAGSURBVAMAqnE/0B+KaIAAAAAASUVORK5CYII=)

---

#### **Sahb**
Sahb is a modern, clean, and bilingual developer blog template built with React and TypeScript. Inspired by Pixyll, it offers a content-first, seamless experience for both Arabic (RTL) and English, focusing on speed, optimization, and SEO.

### **Features**

| Feature                         | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| **Bilingual Support**           | Easy switching between Arabic (RTL) and English.      |
| **Dark/Light Theme**            | Automatic detection with manual toggle.               |
| **Fully Responsive**            | Great experience on all devices.                      |
| **Fast & Optimized**            | Built with Vite for performance.                      |
| **Clean Design**                | Minimalist, typography-focused.                       |
| **SEO Optimized**               | Proper meta tags and Open Graph support.              |
| **Achievements Footer Bar**     | Dynamic, auto-scrolling showcase for projects.        |
| **Easy to add other languages** | Dynamic structure allows adding more languages easily |

---

### **Quick Start: Local Development**

| Step                     | Command / Instruction                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **Clone Repository**     | `git clone https://github.com/ShulkwiSEC/shulkwisec.github.io.git`<br>`cd shulkwisec.github.io` |
| **Install Dependencies** | `npm install`                                                                                   |
| **Start Dev Server**     | `npm run dev`                                                                                   |
| **Visit**                | `http://localhost:5000`                                                                         |

---

### **Deployment: GitHub Pages**

| Step                     | Instruction                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **Update Base Path**     | Edit `vite.config.github.ts` for project page deployment. Example: `base: "/shulkwisec.github.io/"` |
| **Push Code**            | Ensure repository is on GitHub                                                                      |
| **Enable GitHub Pages**  | Settings → Pages → gh-pages branch                                                                  |
| **Automatic Deployment** | GitHub Actions `.github/workflows/deploy.yml` builds and deploys automatically                      |

---

### **Manual Build for Static Hosting**

| Command         | Description                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| `npm run build` | Builds project; files in `dist/public` ready for any static host (Netlify, Vercel, AWS S3) |

---

### **Configuration: template.json**

| Section          | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| **site**         | General site info: title, subtitle, description (ar & en)        |
| **owner**        | Blog owner info: name, bio, email, social links                  |
| **blogs**        | Blog posts management                                            |
| **achievements** | Array of objects: title, subtitle, optional banner, fallback URL |

---

### **Customization**

| Element                   | File / Location                               | Description               |
| ------------------------- | --------------------------------------------- | ------------------------- |
| **Site Title & Subtitle** | `client/src/data/template.json`               | Edit `site` object        |
| **About Page**            | `client/src/pages/About.tsx`                  | Update page content       |
| **Social Links**          | `client/src/data/template.json`               | Update `owner.social`     |
| **Colors**                | `client/src/index.css` + `tailwind.config.ts` | Modify theme colors       |
| **Blogs**                 | `client/src/data/template.json`               | Edit `blogs.posts`        |
| **Achievements**          | `client/src/data/template.json`               | Edit `achievements` array |

---

### **Project Structure**

| Folder / File            | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `.github/workflows/`     | GitHub Actions for deployment                    |
| `client/`                | React client folder                              |
| `client/public/`         | Static assets (favicon, icons)                   |
| `client/src/components/` | Reusable React components (BlogCard, Navigation) |
| `client/src/contexts/`   | React Contexts (LanguageContext, ThemeContext)   |
| `client/src/data/`       | Data files (`blogPosts.ts`, `template.json`)     |
| `client/src/hooks/`      | Custom hooks                                     |
| `client/src/lib/`        | Utility functions                                |
| `client/src/pages/`      | Page components (About.tsx, BlogPost.tsx)        |
| `client/src/App.tsx`     | Main application component                       |
| `client/src/index.css`   | Global styles (Tailwind CSS)                     |
| `client/src/main.tsx`    | Entry point                                      |
| `client/index.html`      | Main HTML template                               |
| `dist/`                  | Production build output                          |
| `package.json`           | Dependencies & scripts                           |
| `postcss.config.js`      | PostCSS config                                   |
| `tailwind.config.ts`     | Tailwind CSS config                              |
| `vite.config.ts`         | Local Vite config                                |
| `vite.config.github.ts`  | GitHub Pages Vite config                         |

---

### **Technologies**

| Technology   | Description                             |
| ------------ | --------------------------------------- |
| React 18     | JS library for building UIs             |
| TypeScript   | Typed JS superset                       |
| Vite         | Fast build tool for development         |
| Tailwind CSS | Utility-first CSS framework             |
| Swiper       | Touch slider with hardware acceleration |
| Wouter       | Tiny React router (~1KB)                |
| Lucide React | Open-source icon collection             |

---

### **Content Guidelines**

| Type     | Notes                                                                |
| -------- | -------------------------------------------------------------------- |
| Markdown | Markdown-like support [link](https://en.wikipedia.org/wiki/Markdown) |

---

### **License**

| Type | Details             |
| ---- | ------------------- |
| MIT  | Open-source license |