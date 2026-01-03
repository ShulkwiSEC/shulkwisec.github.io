import fs from 'fs';
import path from 'path';

const CLIENT_DIR = path.join(process.cwd(), 'client');
const DATA_DIR = path.join(CLIENT_DIR, 'src', 'data');
const PUBLIC_DIR = path.join(CLIENT_DIR, 'public');

const TEMPLATE_FILE = path.join(DATA_DIR, 'template.json');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(PUBLIC_DIR, 'robots.txt');

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
    let baseUrl = site.url || 'https://shulkwisec.github.io';
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    const currentDate = new Date().toISOString().split('T')[0];

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

    // External pages (e.g., /page/resume)
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

    // Blog posts
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

    // Generate robots.txt
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
