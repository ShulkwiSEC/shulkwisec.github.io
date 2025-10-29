import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface PortfolioCardProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export default function PortfolioCard({ image, title, description, tags, link }: PortfolioCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>

        <Button
          variant="outline"
          size="sm"
          className="group/btn"
          data-testid={`button-view-project-${title.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={() => link && console.log('Navigate to:', link)}
        >
          {t('viewProject')}
          <ExternalLink className="w-3 h-3 ltr:ml-2 rtl:mr-2 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
}
