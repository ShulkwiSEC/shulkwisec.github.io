import { useState } from 'react';
import { useLanguage } from '@/contexts/Language';
import { useGiscusStats } from '@/hooks/blog/GiscusStats';
import { Pin, MessageSquare, ThumbsUp, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig, blogPosts, commentsConfig } from '@/lib/data';
import SaveButton from '@/components/common/Save';
import ShareButton from '@/components/common/Share';
import Views from '@/components/common/Views';
import { Card } from '@/components/ui/card';
import { BannerMedia } from '@/types/blog';

interface BlogItemProps {
  id?: string;
  date: string;
  title: string;
  excerpt: string;
  link?: string;
  pin?: boolean;
  banner?: string | BannerMedia;
}

export default function BlogItem({ id, date, title, excerpt, link, pin, banner }: BlogItemProps) {
  const { t } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Extract the pathname from the link for Giscus mapping
  const pathname = link || '';

  const { data: stats, isLoading: statsLoading } = useGiscusStats({
    repo: commentsConfig.giscus.repo,
    term: pathname,
    category: commentsConfig.giscus.category
  });

  const postId = id || link?.split('/').pop() || '';
  const postUrl = link ? `${window.location.origin}${link}` : window.location.href;

  // Parse banner data
  const bannerData: BannerMedia | null = banner
    ? typeof banner === 'string'
      ? { url: banner, type: 'image' }
      : banner
    : null;

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
    return 'image'; // default
  };

  const renderBanner = () => {
    if (!bannerData) return null;

    const mediaType = getBannerType(bannerData);
    const altText = bannerData.alt || title;

    const bannerContent = (() => {
      switch (mediaType) {
        case 'video':
          return (
            <div className="relative group">
              <video
                className="w-full h-full object-cover"
                poster={bannerData.thumbnail}
                controls={isVideoPlaying}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                preload="metadata"
              >
                <source src={bannerData.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>
          );

        case 'gif':
        case 'image':
          return (
            <img
              src={bannerData.url}
              alt={altText}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          );

        case 'embed':
        case 'slides':
          return (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={bannerData.url}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={altText}
              />
            </div>
          );

        case 'doc':
          return (
            <div className="relative w-full bg-muted/30 flex items-center justify-center p-8">
              {bannerData.thumbnail ? (
                <img
                  src={bannerData.thumbnail}
                  alt={altText}
                  className="w-full h-full object-contain max-h-64"
                  loading="lazy"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm text-muted-foreground">Document Preview</p>
                </div>
              )}
            </div>
          );

        default:
          return null;
      }
    })();

    return (
      <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-muted/20">
        {bannerContent}
      </div>
    );
  };

  return (
    <Card className="mb-8 last:mb-0 block group overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border bg-transparent shadow-none">
      <div className={banner ? "" : "p-6"}>
        {/* Banner Section */}
        {banner && (
          <a href={link || '#'} className="block">
            {renderBanner()}
          </a>
        )}

        <div className={banner ? "p-6 pt-0" : ""}>

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
      </div>
    </Card>
  );
}
