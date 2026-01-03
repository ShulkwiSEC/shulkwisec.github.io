import { useEffect, useState, useRef } from 'react';
import { useParams } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/layout/SEO';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import DOMPurify from 'dompurify';
import { Skeleton } from '@/components/ui/skeleton';


export default function MarkdownPage() {
  const { slug } = useParams();
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (contentRef.current && !loading) {
      const codeBlocks = contentRef.current.querySelectorAll('pre code');
      codeBlocks.forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        if (pre) {
          pre.style.position = 'relative';
          const copyButton = document.createElement('button');
          copyButton.innerText = 'Copy';
          copyButton.className = 'absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded text-xs';
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
    }
  }, [markdown, loading]);

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

  const createMarkup = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html, {
        ADD_TAGS: ['rssapp-wall', 'iframe'],
        ADD_ATTR: ['id', 'src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'target']
      })
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={slug ? slug.charAt(0) : ''}
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
            dangerouslySetInnerHTML={createMarkup(marked.parse(markdown) as string)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
