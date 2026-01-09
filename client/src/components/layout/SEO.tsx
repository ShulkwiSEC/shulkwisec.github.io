import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig, ownerConfig } from '@/lib/data';
import { useLanguage } from '@/contexts/Language';
import { useLocation } from 'wouter';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    article?: boolean;
    publishedTime?: string;
    tags?: string[];
    canonicalPath?: string;
}

const SEO: React.FC<SEOProps> = ({
    title: propsTitle,
    description: propsDescription,
    image: propsImage,
    article = false,
    publishedTime,
    tags,
    canonicalPath
}) => {
    const { language } = useLanguage();
    const [location] = useLocation();

    // Internal state to hold auto-detected values
    const [autoData, setAutoData] = useState({
        title: propsTitle,
        description: propsDescription,
        image: propsImage
    });

    useEffect(() => {
        // Sync state when props change
        setAutoData({
            title: propsTitle,
            description: propsDescription,
            image: propsImage
        });
    }, [propsTitle, propsDescription, propsImage]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const scrapeDOM = () => {
            // Only scrape what's missing
            const needsTitle = !propsTitle;
            const needsDescription = !propsDescription;
            const needsImage = !propsImage;

            if (!needsTitle && !needsDescription && !needsImage) return;

            // 1. Title: First h1 text
            const firstH1 = document.querySelector("h1")?.innerText?.trim();

            // 2. Description: First <p> text inside <main> or <article>
            const contentArea = document.querySelector("main, article") || document.body;
            const firstP = contentArea.querySelector("p")?.innerText?.trim().substring(0, 160);

            // 3. Image: src of the first <img> in content area (ignore small icons/logos)
            const allImgs = Array.from(contentArea.querySelectorAll("img"));
            const firstMainImg = allImgs.find(img => {
                const className = (img.className || '').toString().toLowerCase();
                const id = (img.id || '').toString().toLowerCase();
                const src = (img.getAttribute('src') || '').toLowerCase();

                // Heuristic to ignore small icons/logos/avatars
                const isExcluded = /logo|icon|avatar|favicon|nav|brand|sidebar|profile/i.test(className + id + src);
                const isTooSmall = img.naturalWidth > 0 && img.naturalWidth < 120; // Ignore very small images if loaded

                return !isExcluded && !isTooSmall && src.length > 0;
            });

            setAutoData(prev => ({
                title: propsTitle || firstH1 || prev.title,
                description: propsDescription || firstP || prev.description,
                image: propsImage || (firstMainImg as HTMLImageElement)?.src || prev.image
            }));
        };

        const scheduleScrape = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(scrapeDOM, 500);
        };

        // Initial scrape after route change or mount
        scheduleScrape();

        // MutationObserver to ensure we catch content that loads asynchronously
        const observer = new MutationObserver((mutations) => {
            const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
            if (hasAddedNodes) {
                scheduleScrape();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [location, propsTitle, propsDescription, propsImage]);

    // Configuration values
    const siteTitle = siteConfig.title[language] || 'shulkwisec';
    const siteSubtitle = siteConfig.subtitle[language] || '';
    const siteDescription = siteConfig.description[language] || '';
    const siteUrl = siteConfig.url;

    // Resolving final values: Priority: Props > Auto-detected > Site Default
    const finalTitle = autoData.title || siteTitle;
    const fullTitle = autoData.title ? `${autoData.title} | ${siteTitle}` : `${siteTitle} - ${siteSubtitle}`;
    const metaDescription = autoData.description || siteDescription;
    const metaImageRaw = autoData.image;
    const metaImage = metaImageRaw
        ? (metaImageRaw.startsWith('http') ? metaImageRaw : `${siteUrl}${metaImageRaw}`)
        : `${siteUrl}/favicon.png`;

    const canonicalUrl = `${siteUrl}${canonicalPath || location}`;

    const structuredData = article ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": finalTitle,
        "description": metaDescription,
        "image": [metaImage],
        "datePublished": publishedTime,
        "author": [{
            "@type": "Person",
            "name": ownerConfig.name[language],
            "url": siteUrl
        }]
    } : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteTitle,
        "url": siteUrl,
        "description": siteDescription
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={article ? 'article' : 'website'} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {ownerConfig.social?.twitter && (
                <meta name="twitter:creator" content={`@${ownerConfig.social.twitter.split('/').pop()}`} />
            )}

            {/* Article Specific */}
            {article && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {article && tags && tags.map(tag => (
                <meta key={tag} property="article:tag" content={tag} />
            ))}

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Helmet>
    );
};

export default SEO;