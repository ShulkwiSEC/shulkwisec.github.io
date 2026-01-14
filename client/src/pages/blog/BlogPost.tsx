import { marked } from '@/lib/marked';
import { useRoute } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useBlogPosts } from '@/hooks/blog/Posts';
import { useLanguage } from '@/contexts/Language';
import { useTheme } from '@/contexts/Theme';
import Giscus from '@giscus/react';
import { commentsConfig } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pin, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SaveButton from '@/components/common/Save';
import ShareButton from '@/components/common/Share';
import Views from '@/components/common/Views';
import SEO from '@/components/layout/SEO';
import { useMediaModal } from '@/contexts/MediaModal';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';


import { BlogPost as BlogPostType, BannerMedia } from '@/types/blog';

// Configure DOMPurify to open external links in new tab
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href');
    if (href && (href.startsWith('http') || href.startsWith('//'))) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

export default function BlogPost() {
  const [, params] = useRoute('/post/:id');
  const { posts, loading } = useBlogPosts();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const post = posts.find((p: BlogPostType) => p.id === params?.id);
  const contentRef = useRef<HTMLDivElement>(null);

  const postId = params?.id || '';

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // State for video banner
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Media modal for clickable banners
  const { showMedia } = useMediaModal();

  // Calculate reading metrics
  const stats = useMemo(() => {
    if (!post?.content) return { words: 0, time: 0 };
    const words = post.content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200);
    return { words, time };
  }, [post?.content]);

  // Memoize markdown parsing
  const htmlContent = useMemo(() => {
    if (!post?.content) return '';
    const rawHtml = marked.parse(post.content) as string;
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: [
        'span', 'div', 'pre', 'code', 'svg', 'path', 'circle', 'rect',
        'line', 'polyline', 'polygon', 'ellipse', 'use', 'defs', 'clippath', 'g',
        'math', 'annotation', 'semantics', 'mrow', 'msub', 'msup', 'mi', 'mo', 'mn'
      ],
      ADD_ATTR: [
        'class', 'style', 'aria-hidden', 'viewbox', 'd', 'fill', 'stroke',
        'x', 'y', 'width', 'height', 'points', 'cx', 'cy', 'r', 'rx', 'ry',
        'xlink:href', 'target', 'rel', 'id'
      ]
    });
  }, [post?.content]);

  useEffect(() => {
    if (contentRef.current) {
      // 1. Syntax Highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach(codeBlock => {
        // Skip mermaid blocks as they are handled differently
        if (codeBlock.parentElement?.classList.contains('mermaid')) return;

        hljs.highlightElement(codeBlock as HTMLElement);

        // 2. Add Copy Button
        const pre = codeBlock.parentElement;
        if (pre) {
          // Avoid adding multiple buttons if re-running
          if (pre.querySelector('.copy-btn')) return;

          pre.style.position = 'relative';
          const copyButton = document.createElement('button');
          copyButton.innerText = 'Copy';
          copyButton.className = 'copy-btn absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors';
          copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.textContent || '');
            copyButton.innerText = 'Copied!';
            setTimeout(() => {
              copyButton.innerText = 'Copy';
            }, 2000);
          });
          pre.appendChild(copyButton);
        }
      });

      // 3. Render Mermaid Diagrams
      const mermaidDivs = contentRef.current.querySelectorAll('.mermaid');
      if (mermaidDivs.length > 0) {
        console.log(`[Mermaid] Found ${mermaidDivs.length} diagrams, initializing...`);

        try {
          mermaid.initialize({
            startOnLoad: false,
            theme: theme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
          });

          mermaid.run({
            nodes: Array.from(mermaidDivs) as HTMLElement[],
          }).then(() => {
            console.log('[Mermaid] Render successful');
          }).catch(err => {
            console.error('[Mermaid] Render error:', err);
          });
        } catch (err) {
          console.error('[Mermaid] Initialization error:', err);
        }
      }
    }
  }, [htmlContent, theme]); // Run when HTML content or theme updates

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
          <h1 className="text-3xl font-bold mb-4">{t('PostNotFound')}</h1>
          <p className="text-muted-foreground mb-6">{t('PostNotFoundText')}</p>
          <Button variant="outline" asChild>
            <a href="/">
              <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t('BacktoHome')}
            </a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const postTitle = post.title[language] || post.title['en'] || Object.values(post.title)[0] || '';

  // Extract banner URL from string or BannerMedia object
  const getBannerUrl = (banner: string | BannerMedia | undefined): string | undefined => {
    if (!banner) return undefined;
    if (typeof banner === 'string') return banner;
    if (typeof banner === 'object' && banner.url) return banner.url;
    return undefined;
  };

  const bannerUrl = getBannerUrl(post.banner);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={postTitle}
        description={post.excerpt[language] || post.excerpt['en']}
        image={bannerUrl}
        article={true}
        publishedTime={post.date}
        tags={post.tags}
        canonicalPath={`/post/${post.id}`}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Button variant="ghost" className="-ml-2 h-9 px-2 sm:px-3" asChild data-testid="button-back">
            <a href="/">
              <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              <span className="hidden xs:inline">{t('back')}</span>
            </a>
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground flex-wrap justify-end">
            <Views postId={postId} shouldIncrement={true} showLabel={true} variant="outline" className="h-8 sm:h-9" />
            <SaveButton postId={postId} showLabel={true} variant="outline" className="h-8 sm:h-9" />
            <ShareButton title={postTitle} variant="outline" className="h-8 sm:h-9" showLabel={true} />
          </div>
        </div>

        <article className="relative">
          {/* Scroll Progress Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
            style={{ scaleX }}
          />

          {/* Banner Section - Full Media Support */}
          {post.banner && (() => {
            const bannerData: BannerMedia | null = typeof post.banner === 'string'
              ? { url: post.banner, type: 'image' }
              : post.banner;

            if (!bannerData) return null;

            // Determine media type from URL if not specified
            const getBannerType = (media: BannerMedia): BannerMedia['type'] => {
              if (media.type) return media.type;
              const url = media.url.toLowerCase();
              if (url.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
              if (url.match(/\.(gif)$/)) return 'gif';
              if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'image';
              if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) return 'embed';
              if (url.includes('slides.google.com') || url.includes('slideshare.net')) return 'slides';
              if (url.match(/\.(pdf|doc|docx|ppt|pptx)$/)) return 'doc';
              return 'image';
            };

            const mediaType = getBannerType(bannerData);
            const altText = bannerData.alt || postTitle;

            // Handler to open media in modal - ALL types now open in modal
            const handleMediaClick = () => {
              showMedia(bannerData);
            };

            const bannerContent = (() => {
              switch (mediaType) {
                case 'video':
                  return (
                    <div
                      className="relative group cursor-pointer"
                      onClick={handleMediaClick}
                    >
                      <video
                        className="w-full h-full object-cover pointer-events-none"
                        poster={bannerData.thumbnail}
                        preload="metadata"
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={bannerData.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to play fullscreen
                      </div>
                    </div>
                  );

                case 'gif':
                case 'image':
                  return (
                    <div className="relative group cursor-pointer" onClick={handleMediaClick}>
                      <img
                        src={bannerData.url}
                        alt={altText}
                        className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to expand
                      </div>
                    </div>
                  );

                case 'embed':
                case 'slides':
                  return (
                    <div
                      className="relative w-full group cursor-pointer"
                      style={{ paddingBottom: '56.25%' }}
                      onClick={handleMediaClick}
                    >
                      <iframe
                        src={bannerData.url}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={altText}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Click to view fullscreen
                      </div>
                    </div>
                  );

                case 'doc':
                  return (
                    <div
                      className="relative w-full bg-muted/30 flex items-center justify-center p-8 cursor-pointer hover:bg-muted/40 transition-colors group"
                      onClick={handleMediaClick}
                    >
                      {bannerData.thumbnail ? (
                        <>
                          <img
                            src={bannerData.thumbnail}
                            alt={altText}
                            className="w-full h-full object-contain max-h-96"
                            loading="lazy"
                          />
                          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-sm text-muted-foreground">Click to view document</p>
                        </div>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })();

            return (
              <div className="relative w-full h-auto max-h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg bg-muted/20">
                {bannerContent}
              </div>
            );
          })()}

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <time data-testid="text-post-date">{post.date}</time>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{stats.time} min read</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{stats.words} words</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex items-center gap-3" data-testid="text-post-title">
            {postTitle}
            {post.pin && (
              <Pin className="w-6 h-6 text-primary fill-primary/20" />
            )}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1 font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            data-testid="text-post-content"
          />

          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-8">{t('Comments')}</h2>
            {commentsConfig.provider === 'giscus' && (
              <Giscus
                id="comments"
                repo={commentsConfig.giscus.repo as `${string}/${string}`}
                repoId={commentsConfig.giscus.repoId}
                category={commentsConfig.giscus.category}
                categoryId={commentsConfig.giscus.categoryId}
                mapping={commentsConfig.giscus.mapping as any}
                strict={commentsConfig.giscus.strict as any}
                reactionsEnabled={commentsConfig.giscus.reactionsEnabled as any}
                emitMetadata={commentsConfig.giscus.emitMetadata as any}
                inputPosition={commentsConfig.giscus.inputPosition as any}
                theme={theme === 'dark' ? 'dark' : 'light'}
                lang={language === 'ar' ? 'ar' : 'en'}
                loading={commentsConfig.giscus.loading as any}
              />
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
