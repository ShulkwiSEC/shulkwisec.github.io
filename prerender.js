import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract basic metadata from Markdown content
function getMetaFromMdContent(content) {
    const images = [];
    // 1. Extract ALL Images
    let match;
    const mdImageRegex = /!\[.*?\]\((.*?)\)/g;
    while ((match = mdImageRegex.exec(content)) !== null) {
        if (match[1]) images.push(match[1]);
    }

    const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;
    while ((match = htmlImageRegex.exec(content)) !== null) {
        if (match[1]) images.push(match[1]);
    }

    // 2. Extract Title
    const titleMatch = content.match(/^#\s+(.*)/m) || content.match(/^\*\*?(.*?)\*\*?$/m);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // 3. Extract and Clean Description
    let descText = content
        .replace(/<style[\s\S]*?<\/style>/gi, '') // Remove style blocks
        .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script blocks
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove md images
        .replace(/<img[^>]+>/g, '') // Remove html images
        .replace(/#+\s+.*$/gm, '') // Remove headers
        .replace(/<[^>]+>/g, ' ') // Replace HTML tags with space
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text
        .replace(/[*_`~-]/g, '') // Remove formatting chars
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();

    return {
        title,
        description: descText.substring(0, 200) + (descText.length > 200 ? '...' : ''),
        images: images
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
        const fullTitle = meta.title ? `${meta.title} | ${siteTitle}` : siteTitle;
        const url = `${siteUrl}${route}`;
        // Fallback description only if extracted one is empty
        const desc = meta.description && meta.description.length > 10 ? meta.description : template.site.description[lang];

        // Image Logic: Use extracted images, or fall back to banner/site default
        let imageTags = '';

        // Ensure we extract the URL string if the image is a BannerMedia object
        const getUrl = (img) => {
            if (!img) return null;
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img.url) return img.url;
            return null;
        };

        const imagesToUse = (meta.images && meta.images.length > 0 ? meta.images : (meta.image ? [meta.image] : []))
            .map(getUrl)
            .filter(Boolean);

        const primaryImageRaw = imagesToUse[0] || '/favicon.png';
        const primaryImage = primaryImageRaw.startsWith('http') ? primaryImageRaw : `${siteUrl}${primaryImageRaw.startsWith('/') ? '' : '/'}${primaryImageRaw}`;

        imagesToUse.forEach(img => {
            let absoluteUrl = img.startsWith('http') ? img :
                img.startsWith('/') ? `${siteUrl}${img}` : `${siteUrl}/${img}`;
            imageTags += `<meta property="og:image" content="${absoluteUrl}">\n    `;
            imageTags += `<meta name="twitter:image" content="${absoluteUrl}">\n    `;
        });

        if (imagesToUse.length === 0) {
            const fav = `${siteUrl}/favicon.png`;
            imageTags += `<meta property="og:image" content="${fav}">\n    `;
            imageTags += `<meta name="twitter:image" content="${fav}">\n    `;
        }

        // Structured Data (JSON-LD)
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": meta.date ? "BlogPosting" : "WebPage",
            "headline": fullTitle,
            "description": desc,
            "image": primaryImage,
            "url": url,
            "author": {
                "@type": "Person",
                "name": template.owner.name[lang] || template.owner.name['en'],
                "url": siteUrl
            }
        };

        if (meta.date) {
            jsonLd.datePublished = new Date(meta.date).toISOString();
            jsonLd.dateModified = new Date(meta.date).toISOString();
        }

        // Tags to inject
        const seoTags = `
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}">
    <meta property="og:type" content="${meta.date ? 'article' : 'website'}">
    <meta property="og:title" content="${fullTitle}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${fullTitle}">
    <meta name="twitter:description" content="${desc}">
    ${imageTags}
    <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
    </script>`;

        // Replace </head> to inject tags
        let finalHtml = baseHtml
            .replace(/<title>.*?<\/title>/, '')
            .replace(/<meta name="description".*?>/, '')
            .replace(/<meta property="og:title".*?>/, '')
            .replace(/<meta property="og:description".*?>/, '')
            .replace(/<meta property="og:image".*?>/g, '')
            .replace(/<meta property="og:url".*?>/, '')
            .replace(/<meta name="twitter:title".*?>/, '')
            .replace(/<meta name="twitter:description".*?>/, '')
            .replace(/<meta name="twitter:image".*?>/g, '')
            .replace('</head>', `${seoTags}\n</head>`);

        const targetDir = path.join(distDir, route);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(path.join(targetDir, 'index.html'), finalHtml);
        console.log(`  ✓ Created: ${route} (Img: ${imagesToUse.length}, Desc: ${desc.substring(0, 20)}...)`);
    };

    // 1. Process Blog Posts
    if (template.blog?.posts) {
        template.blog.posts.forEach(post => {
            createPage(`/post/${post.id}`, {
                title: post.title[lang] || post.title['en'],
                description: post.excerpt?.[lang] || post.excerpt?.['en'],
                image: post.banner,
                date: post.date // Pass date for JSON-LD
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
                meta.images = extracted.images;
            }

            createPage(page.url, meta);
        });
    }

    console.log('✨ Social Cards Generated Successfully.');
}

run().catch(console.error);
