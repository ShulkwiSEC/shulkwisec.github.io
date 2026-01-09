import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract basic metadata from Markdown content
function getMetaFromMdContent(content) {
    // 1. Image (md or html)
    const mdImage = content.match(/!\[.*?\]\((.*?)\)/);
    const htmlImage = content.match(/<img[^>]+src=["']([^"']+)["']/);
    const image = mdImage ? mdImage[1] : (htmlImage ? htmlImage[1] : null);

    // 2. Title (# Title or **Title**)
    const titleMatch = content.match(/^#\s+(.*)/m) || content.match(/^\*\*?(.*?)\*\*?$/m);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // 3. Description (Clean text)
    const cleanContent = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/#+\s+.*?\n/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return {
        title,
        description: cleanContent.substring(0, 160) + (cleanContent.length > 160 ? '...' : ''),
        image
    };
}

async function run() {
    console.log('⚡ Prerendering Social Cards...');

    const distDir = path.resolve(__dirname, 'dist', 'public');
    const dataDir = path.resolve(__dirname, 'client', 'src', 'data');
    const templatePath = path.resolve(dataDir, 'template.json');
    const indexPath = path.join(distDir, 'index.html');

    if (!fs.existsSync(indexPath) || !fs.existsSync(templatePath)) {
        console.warn('⚠️ Missing index.html or template.json. Skipping prerender.');
        return;
    }

    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const baseHtml = fs.readFileSync(indexPath, 'utf8');

    // Site defaults
    const lang = template.site?.languages?.[0] || 'en';
    const siteTitle = template.site?.title?.[lang] || 'shulkwisec';
    const siteUrl = (template.site?.url || 'https://shulkwisec.github.io').replace(/\/$/, '');

    // Function to create index.html in subfolder
    const createPage = (route, meta) => {
        // Determine image URL
        let imageUrl = `${siteUrl}/favicon.png`;
        if (meta.image) {
            imageUrl = meta.image.startsWith('http') ? meta.image :
                meta.image.startsWith('/') ? `${siteUrl}${meta.image}` : `${siteUrl}/${meta.image}`;
        }

        const fullTitle = meta.title ? `${meta.title} | ${siteTitle}` : siteTitle;
        const url = `${siteUrl}${route}`;
        const desc = meta.description || template.site.description[lang];

        // Tags to inject
        const seoTags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${imageUrl}">`;

        // Replace </head> to inject tags
        // Also try to strip existing title/meta description to prevent dupes (simple regex)
        let finalHtml = baseHtml
            .replace(/<title>.*?<\/title>/, '')
            .replace(/<meta name="description".*?>/, '')
            .replace('</head>', `${seoTags}\n</head>`);

        const targetDir = path.join(distDir, route);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, 'index.html'), finalHtml);
        console.log(`  ✓ Created: ${route}`);
    };

    // 1. Process Blog Posts
    if (template.blog?.posts) {
        template.blog.posts.forEach(post => {
            createPage(`/post/${post.id}`, {
                title: post.title[lang] || post.title['en'],
                description: post.excerpt?.[lang] || post.excerpt?.['en'],
                image: post.banner
            });
        });
    }

    // 2. Process External Pages (Markdown)
    if (template.site?.external) {
        template.site.external.forEach(page => {
            if (!page.url?.startsWith('/page/')) return;

            const slug = page.url.replace('/page/', '');
            const mdPath = path.join(dataDir, `${slug}.md`);

            let meta = { title: page.name[lang], description: '', image: null };

            if (fs.existsSync(mdPath)) {
                const mdContent = fs.readFileSync(mdPath, 'utf8');
                const extracted = getMetaFromMdContent(mdContent);
                meta.title = extracted.title || meta.title;
                meta.description = extracted.description;
                meta.image = extracted.image;
            }

            createPage(page.url, meta);
        });
    }

    console.log('✨ Social Cards Generated Successfully.');
}

run().catch(console.error);
