import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/layout/SEO';
import { marked } from '@/lib/marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import DOMPurify from 'dompurify';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/Theme';
import mermaid from 'mermaid';
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

  useEffect(() => {
    if (contentRef.current && !loading) {
      // 1. Syntax Highlighting
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach(codeBlock => {
        if (codeBlock.parentElement?.classList.contains('mermaid')) return;

        hljs.highlightElement(codeBlock as HTMLElement);

        // 2. Add Copy Button
        const pre = codeBlock.parentElement;
        if (pre) {
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
  }, [htmlContent, loading, theme]);

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
