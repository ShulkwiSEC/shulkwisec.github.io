import { marked } from 'marked';
import { useRoute } from 'wouter';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import { blogPosts } from '@/data/blogPosts';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { useEffect, useRef } from 'react';

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
});

export default function BlogPost() {
  const [, params] = useRoute('/post/:id');
  const post = blogPosts.find(p => p.id === params?.id);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
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
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <SimpleHeader />
        <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Button variant="outline" asChild>
            <a href="/">
              <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              Back to Home
            </a>
          </Button>
        </main>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <Button variant="ghost" className="mb-6 -ml-2" asChild data-testid="button-back">
          <a href="/">
            <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            Back
          </a>
        </Button>

        <article>
          {post.banner && (
            <img 
              src={post.banner} 
              alt={post.title} 
              className="w-full h-48 object-cover rounded-lg mb-8"
            />
          )}
          <time className="text-sm text-muted-foreground block mb-4" data-testid="text-post-date">
            {post.date}
          </time>

          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2" data-testid="text-post-title">
            {post.title}
            {post.pin && (
              <span className="inline-flex items-center gap-1 text-sm text-primary" title="Pinned">
                <Pin className="w-4 h-4" />
              </span>
            )}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div 
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
            data-testid="text-post-content"
          />
        </article>
      </main>

      <SimpleFooter />
    </div>
  );
}

function formatContent(content: string): string {
  return DOMPurify.sanitize(marked.parse(content) as string);
}
