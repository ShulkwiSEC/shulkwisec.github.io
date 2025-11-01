import { useLanguage } from '@/contexts/LanguageContext';
import { Pin } from 'lucide-react';

interface SimpleBlogPostProps {
  date: string;
  title: string;
  excerpt: string;
  link?: string;
  pin?: boolean;
}

export default function SimpleBlogPost({ date, title, excerpt, link, pin }: SimpleBlogPostProps) {
  const { t } = useLanguage();

  return (
    <a 
      href={link || '#'} 
      className="block group p-4 -m-4 rounded-lg transition-colors hover:bg-muted/20"
      data-testid={`link-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <article className="mb-12 last:mb-0">
        <div className="flex items-center gap-2 mb-2">
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
        <p className="text-foreground/80 leading-relaxed mb-3">{excerpt}</p>
        <div className="text-sm text-primary font-semibold">
          {t('readMore')} →
        </div>
      </article>
    </a>
  );
}
