import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig, ownerConfig } from '@/lib/data';
import { useLanguage } from '@/contexts/Language';

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
    title,
    description,
    image,
    article = false,
    publishedTime,
    tags,
    canonicalPath
}) => {
    const { language } = useLanguage();

    const siteTitle = siteConfig.title[language] || 'shulkwisec';
    const siteSubtitle = siteConfig.subtitle[language] || '';
    const siteDescription = siteConfig.description[language] || '';
    const siteUrl = siteConfig.url;

    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - ${siteSubtitle}`;
    const metaDescription = description || siteDescription;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/favicon.png`;
    const canonicalUrl = `${siteUrl}${canonicalPath || ''}`;

    const structuredData = article ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
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
            {/* Basic Meta Tags */}
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

            {/* Modern Meta Tags */}
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Helmet>
    );
};

export default SEO;
