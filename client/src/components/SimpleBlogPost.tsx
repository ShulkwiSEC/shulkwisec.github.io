import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleBlogPostProps {
  date: string;
  title: string;
  excerpt: string;
  link?: string;
}

export default function SimpleBlogPost({ date, title, excerpt, link }: SimpleBlogPostProps) {
  const { t } = useLanguage();

  return (
    <a 
      href={link || '#'} 
      className="block group p-4 -m-4 rounded-lg transition-colors hover:bg-muted/20"
      data-testid={`link-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <article className="mb-12 last:mb-0">
        <time className="text-sm text-muted-foreground block mb-2">{date}</time>
        <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
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
