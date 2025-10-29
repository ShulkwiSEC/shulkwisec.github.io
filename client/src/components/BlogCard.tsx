// BlogCard.tsx
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogCardProps {
  image: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  link?: string;
}

export default function BlogCard({ image, category, title, excerpt, date, readTime, link }: BlogCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-visible relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group rounded-xl">
      {/* Image & Category */}
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-4 ltr:left-4 rtl:right-4">
          {category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-6 bg-black/10 dark:bg-white/10">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readTime} {t('minRead')}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 inline-block border-b-2 border-blue-500 transition-all duration-300">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>

        {/* Read More */}
        <Button
          variant="ghost"
          size="sm"
          className="group/btn p-0 h-auto"
          data-testid={`button-read-more-${title.toLowerCase().replace(/\s+/g, '-')}`}
          asChild
        >
          <a
            href={link || '#'}
            className="inline-flex items-center border-b-2 border-transparent hover:border-blue-500 transition-colors duration-300"
          >
            {t('readMore')}
            <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
