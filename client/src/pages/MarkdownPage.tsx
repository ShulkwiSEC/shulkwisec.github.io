import { useEffect, useState, useRef } from 'react';
import { useParams } from 'wouter';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import DOMPurify from 'dompurify';

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
});

export default function MarkdownPage() {
  const { slug } = useParams();
  const [markdown, setMarkdown] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      import(`@/data/${slug}.md?raw`)
        .then(module => {
          setMarkdown(module.default);
        })
        .catch(err => {
          console.error(`Failed to load markdown file: ${err}`);
          setMarkdown('# Page not found');
        });
    }
  }, [slug]);

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
  }, [markdown]);

  const createMarkup = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <div 
          ref={contentRef}
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={createMarkup(marked(markdown))}
        />
      </main>
      <SimpleFooter />
    </div>
  );
}
