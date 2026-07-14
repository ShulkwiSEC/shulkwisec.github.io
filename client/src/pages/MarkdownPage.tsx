import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/layout/SEO';
import { marked } from '@/lib/marked';
import DOMPurify from 'dompurify';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/Theme';
import { useContentEnhancements } from '@/hooks/blog/ContentEnhancements';
import 'katex/dist/katex.min.css';
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

export default function MarkdownPage() {
  const { slug } = useParams();
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      import(`@/data/${slug}.md?raw`)
        .then(module => {
          setMarkdown(module.default);
        })
        .catch(err => {
          console.error(`Failed to load markdown file: ${err}`);
          setMarkdown('# Page not found');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  const htmlContent = useMemo(() => {
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: [
        'span', 'div', 'pre', 'code', 'svg', 'path', 'circle', 'rect',
        'line', 'polyline', 'polygon', 'ellipse', 'use', 'defs', 'clippath', 'g',
        'math', 'annotation', 'semantics', 'mrow', 'msub', 'msup', 'mi', 'mo', 'mn',
        'rssapp-wall', 'iframe'
      ],
      ADD_ATTR: [
        'class', 'style', 'aria-hidden', 'viewbox', 'd', 'fill', 'stroke',
        'x', 'y', 'width', 'height', 'points', 'cx', 'cy', 'r', 'rx', 'ry',
        'xlink:href', 'target', 'rel', 'id', 'src', 'frameborder', 'allow', 'allowfullscreen'
      ]
    });
  }, [markdown]);

  useContentEnhancements(contentRef, htmlContent, theme);

  useEffect(() => {
    if (markdown.includes('<rssapp-wall')) {
      const src = "https://widget.rss.app/v1/wall.js";
      // Check if script is already present to prevent duplicate execution/errors
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [markdown]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : ''}
        canonicalPath={`/page/${slug}`}
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : (
          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
