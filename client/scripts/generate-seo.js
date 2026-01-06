import fs from 'fs';
import path from 'path';

const CLIENT_DIR = path.join(process.cwd(), 'client');
const DATA_DIR = path.join(CLIENT_DIR, 'src', 'data');
const PUBLIC_DIR = path.join(CLIENT_DIR, 'public');

const TEMPLATE_FILE = path.join(DATA_DIR, 'template.json');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(PUBLIC_DIR, 'robots.txt');
const INDEX_FILE = path.join(CLIENT_DIR, 'index.html');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'manifest.json');

// Helper to format date to YYYY-MM-DD
function formatDate(dateStr) {
  try {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

async function generateSEO() {
  try {
    const templateData = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));
    const { site, blog } = templateData;
    const defaultLang = site.languages?.[0] || 'en';

    const title = site.title?.[defaultLang] || 'shulkwisec';
    const description = site.description?.[defaultLang] || '';
    let baseUrl = site.url || 'https://shulkwisec.github.io';
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const currentDate = new Date().toISOString().split('T')[0];

    // 1. Update index.html (Static Injection for SEO)
    if (fs.existsSync(INDEX_FILE)) {
      let htmlContent = fs.readFileSync(INDEX_FILE, 'utf8');

      // Update Title
      htmlContent = htmlContent.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

      // Update Meta Description
      htmlContent = htmlContent.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`);

      // Update PWA Banner Content
      htmlContent = htmlContent.replace(/<h3 id="pwa-title">.*?<\/h3>/, `<h3 id="pwa-title">${title}</h3>`);
      const installText = defaultLang === 'ar' ? 'قم بتثبيت التطبيق للحصول على تجربة أفضل' : 'Install for a better experience';
      htmlContent = htmlContent.replace(/<p id="pwa-desc">.*?<\/p>/, `<p id="pwa-desc">${installText}</p>`);

      fs.writeFileSync(INDEX_FILE, htmlContent);
      console.log(`Updated ${INDEX_FILE} with latest template data.`);
    }

    // 2. Update manifest.json
    if (fs.existsSync(MANIFEST_FILE)) {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
      manifest.name = title;
      manifest.short_name = title;
      manifest.description = description;
      manifest.start_url = "/";

      fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
      console.log(`Updated ${MANIFEST_FILE} with latest template data.`);
    }

    // 3. Generate sitemap.xml
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

    if (site.external) {
      site.external.forEach(page => {
        let url = page.url;
        if (url) {
          if (!url.startsWith('/')) url = '/' + url;
          sitemap += `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      });
    }

    if (blog && blog.posts) {
      blog.posts.forEach(post => {
        if (!post.id) return;
        const postDate = formatDate(post.date);
        sitemap += `
  <url>
    <loc>${baseUrl}/post/${post.id}</loc>
    <lastmod>${postDate}</lastmod>
    <priority>0.7</priority>
  </url>`;
      });
    }

    sitemap += `
</urlset>`;

    fs.writeFileSync(SITEMAP_FILE, sitemap);
    console.log(`Generated sitemap at ${SITEMAP_FILE}`);

    // 4. Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
    fs.writeFileSync(ROBOTS_FILE, robotsTxt);
    console.log(`Generated robots.txt at ${ROBOTS_FILE}`);

  } catch (error) {
    console.error('Error generating SEO files:', error);
    process.exit(1);
  }
}

generateSEO();
