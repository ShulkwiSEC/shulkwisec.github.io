import { useLanguage } from '@/contexts/Language';
import { useGiscusStats } from '@/hooks/blog/GiscusStats';
import { Pin, MessageSquare, ThumbsUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig, blogPosts, commentsConfig } from '@/lib/data';
import SaveButton from '@/components/common/Save';
import ShareButton from '@/components/common/Share';
import Views from '@/components/common/Views';
import { Card } from '@/components/ui/card';

interface BlogItemProps {
  id?: string;
  date: string;
  title: string;
  excerpt: string;
  link?: string;
  pin?: boolean;
}

export default function BlogItem({ id, date, title, excerpt, link, pin }: BlogItemProps) {
  const { t } = useLanguage();

  // Extract the pathname from the link for Giscus mapping
  const pathname = link || '';

  const { data: stats, isLoading: statsLoading } = useGiscusStats({
    repo: commentsConfig.giscus.repo,
    term: pathname,
    category: commentsConfig.giscus.category
  });

  const postId = id || link?.split('/').pop() || '';
  const postUrl = link ? `${window.location.origin}${link}` : window.location.href;

  return (
    <Card className="mb-8 last:mb-0 block group overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border bg-transparent shadow-none">
      <div className="p-6">
        <a
          href={link || '#'}
          data-testid={`link-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className="block"
        >
          <div className="flex items-center gap-2 mb-3">
            <time className="text-sm text-muted-foreground">{date}</time>
            {pin && (
              <span className="inline-flex items-center gap-1 text-xs text-primary" title="Pinned">
                <Pin className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
            {title}
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-4 line-clamp-3">{excerpt}</p>
        </a>

        <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 mt-4 pt-4 border-t border-border/50">
          <a href={link || '#'} className="text-sm text-primary font-semibold hover:underline shrink-0">
            {t('readMore')} →
          </a>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm ml-auto">
            {/* Action Group: Views, Save, Share */}
            <div className="flex items-center gap-1">
              <Views postId={postId} className="h-8 px-2" />
              <SaveButton postId={postId} />
              <ShareButton title={title} url={postUrl} />
            </div>

            {/* Stats Group: Comments, Reactions */}
            <div className="flex items-center gap-4 border-l pl-4 border-border/50">
              {statsLoading ? (
                <>
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5" title="Comments">
                    <MessageSquare className="w-4 h-4" />
                    <span>{stats?.totalCommentCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Reactions">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{stats?.reactionsCount || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
