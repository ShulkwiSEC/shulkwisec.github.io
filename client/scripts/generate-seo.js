import fs from 'fs';
import path from 'path';

const CLIENT_DIR = path.join(process.cwd(), 'client');
const DATA_DIR = path.join(CLIENT_DIR, 'src', 'data');
const DIST_DIR = path.join(process.cwd(), 'dist', 'public');

// Priority: Use build output if it exists, otherwise fallback to source (for dev)
const TARGET_DIR = fs.existsSync(DIST_DIR) ? DIST_DIR : path.join(CLIENT_DIR, 'public');
const INDEX_FILE = path.join(fs.existsSync(DIST_DIR) ? DIST_DIR : CLIENT_DIR, 'index.html');

const TEMPLATE_FILE = path.join(DATA_DIR, 'template.json');
const SITEMAP_FILE = path.join(TARGET_DIR, 'sitemap.xml');
const ROBOTS_FILE = path.join(TARGET_DIR, 'robots.txt');
const MANIFEST_FILE = path.join(TARGET_DIR, 'manifest.json');

function decodeContent(content) {
  if (!content) return '';
  try {
    const clean = content.trim();
    if (clean.length > 50 && /^[A-Za-z0-9+/=\n\r]+$/.test(clean)) {
      return Buffer.from(clean, 'base64').toString('utf-8');
    }
  } catch (e) { }
  return content;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove style tags and content
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<[^>]*>/g, '') // Remove all other HTML tags
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/[*_`#>\-]/g, ' ') // Remove markdown symbols
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

function extractMeta(content, defaultTitle, defaultDesc, defaultImg, baseUrl) {
  const text = decodeContent(content);
  if (!text) return { title: defaultTitle, desc: defaultDesc, img: defaultImg };

  // 1. Title: Search for any level of header or first bold text
  const titleMatch = text.match(/^(?:[-*]\s+)?#{1,3}\s+(.*)/m) || text.match(/^\*\*?(.*?)\*\*?$/m);
  const title = cleanText(titleMatch ? titleMatch[1] : defaultTitle);

  // 2. Desc: Gather meaningful text skipping headers and HTML blocks
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('<') && !l.startsWith('---'));

  let descText = lines.slice(0, 3).join(' '); // Combine first few valid lines
  const desc = cleanText(descText || defaultDesc).substring(0, 200);

  // 3. Image: first markdown image or first HTML img src
  const imgMatch = text.match(/!\[.*?\]\((.*?)\)/) || text.match(/<img.*?src=["'](.*?)["']/);
  let img = imgMatch ? imgMatch[1] : defaultImg;
  if (img && !img.startsWith('http')) {
    img = img.startsWith('/') ? `${baseUrl}${img}` : `${baseUrl}/${img}`;
  }

  return { title, desc, img };
}

async function run() {
  console.log('Generating SEO pages...');
  const data = JSON.parse(fs.readFileSync(TEMPLATE_FILE, 'utf8'));
  const masterHtmlRaw = fs.readFileSync(INDEX_FILE, 'utf8');

  // Preliminary cleanup of masterHtml: remove all meta tags and title to avoid duplicates
  let masterHtml = masterHtmlRaw
    .replace(/<title>.*?<\/title>/gi, '')
    .replace(/<meta name="description" content=".*?" \/>/gi, '')
    .replace(/<!-- Social Meta Tags -->[\s\S]*?(?=<link|<script|<\/head)/gi, '')
    .replace(/<meta property="og:.*?" content=".*?" \/>/gi, '')
    .replace(/<meta name="twitter:.*?" content=".*?" \/>/gi, '')
    .replace(/\n\s*\n/g, '\n'); // Remove extra blank lines

  const { site, blog } = data;
  const lang = site.languages?.[0] || 'en';
  const baseTitle = site.title?.[lang] || 'shulkwisec';
  const baseDesc = site.description?.[lang] || '';
  const baseUrl = (site.url || 'https://shulkwisec.github.io').replace(/\/$/, '');
  const baseImg = `${baseUrl}/favicon.png`;
  const currentDate = new Date().toISOString().split('T')[0];

  function createPage(route, title, desc, img) {
    const fullTitle = title === baseTitle ? baseTitle : `${title} | ${baseTitle}`;
    const url = `${baseUrl}${route}`;

    const socialMeta = `
  <title>${fullTitle}</title>
  <meta name="description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="${baseTitle}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${img}" />`;

    let html = masterHtml.replace('</head>', `  ${socialMeta.trim()}\n</head>`);

    const dir = path.join(TARGET_DIR, route);
    if (route !== '/') {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
    }
    return html;
  }

  // 1. Process Blog
  if (blog && blog.posts) {
    blog.posts.forEach(post => {
      const { title, desc, img } = extractMeta(post.content, post.title[lang], post.excerpt?.[lang], post.banner || baseImg, baseUrl);
      createPage(`/post/${post.id}`, title, desc, img);
    });
  }

  // 2. Process External Pages
  if (site.external) {
    site.external.forEach(page => {
      if (!page.url || !page.url.startsWith('/page/')) return;
      const name = page.url.replace('/page/', '');
      const mdPath = path.join(DATA_DIR, `${name}.md`);
      const content = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
      const { title, desc, img } = extractMeta(content, name, baseDesc, baseImg, baseUrl);
      createPage(page.url, title, desc, img);
    });
  }

  // 3. Update main index.html
  const mainHtml = createPage('/', baseTitle, baseDesc, baseImg);
  fs.writeFileSync(INDEX_FILE, mainHtml);

  // 4. Update manifest.json
  const manifestPath = path.join(TARGET_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.name = baseTitle;
    manifest.short_name = baseTitle;
    manifest.description = baseDesc;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  // 5. Generate sitemap.xml
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`;

  if (site.external) {
    site.external.forEach(page => {
      if (page.url) sitemap += `\n  <url>\n    <loc>${baseUrl}${page.url}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });
  }

  if (blog && blog.posts) {
    blog.posts.forEach(post => {
      sitemap += `\n  <url>\n    <loc>${baseUrl}/post/${post.id}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <priority>0.7</priority>\n  </url>`;
    });
  }

  sitemap += `\n</urlset>`;
  fs.writeFileSync(SITEMAP_FILE, sitemap);

  // 6. Generate robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
  fs.writeFileSync(ROBOTS_FILE, robotsTxt);

  console.log('SEO Generation Complete');
}

run().catch(console.error);
