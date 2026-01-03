import { marked } from 'marked';
import { useRoute } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useBlogPosts } from '@/hooks/blog/Posts';
import { useLanguage } from '@/contexts/Language';
import { useTheme } from '@/contexts/Theme';
import Giscus from '@giscus/react';
import { commentsConfig } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SaveButton from '@/components/common/Save';
import ShareButton from '@/components/common/Share';
import Views from '@/components/common/Views';
import SEO from '@/components/layout/SEO';

import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { useEffect, useRef } from 'react';


import { BlogPost as BlogPostType } from '@/types/blog';

export default function BlogPost() {
  const [, params] = useRoute('/post/:id');
  const { posts, loading } = useBlogPosts();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const post = posts.find((p: BlogPostType) => p.id === params?.id);
  const contentRef = useRef<HTMLDivElement>(null);

  const postId = params?.id || '';

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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={postTitle}
        description={post.excerpt[language] || post.excerpt['en']}
        image={post.banner}
        article={true}
        publishedTime={post.date}
        tags={post.tags}
        canonicalPath={`/post/${post.id}`}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" className="-ml-2" asChild data-testid="button-back">
            <a href="/">
              <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t('back')}
            </a>
          </Button>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Views postId={postId} shouldIncrement={true} showLabel={true} variant="outline" />
            <SaveButton postId={postId} showLabel={true} variant="outline" />
            <ShareButton title={postTitle} variant="outline" />
          </div>
        </div>

        <article>
          {post.banner && (
            <img
              src={post.banner}
              alt={postTitle}
              className="w-full h-48 object-cover rounded-lg mb-8"
            />
          )}
          <time className="text-sm text-muted-foreground block mb-4" data-testid="text-post-date">
            {post.date}
          </time>

          <h1 className="text-4xl font-bold mb-4 flex items-center gap-2" data-testid="text-post-title">
            {postTitle}
            {post.pin && (
              <span className="inline-flex items-center gap-1 text-sm text-primary" title="Pinned">
                <Pin className="w-4 h-4" />
              </span>
            )}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string) => (
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

function formatContent(content: string): string {
  return DOMPurify.sanitize(marked.parse(content) as string);
}
