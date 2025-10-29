import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import PortfolioCard from './PortfolioCard';
import dashboardImage from '@assets/generated_images/Dashboard_web_app_project_5ce184c3.png';
import mobileImage from '@assets/generated_images/E-commerce_mobile_app_project_6efaeda8.png';
import aiImage from '@assets/generated_images/AI_platform_project_visual_ae4fa701.png';

const projects = [
  {
    id: 1,
    image: dashboardImage,
    title: 'Analytics Dashboard',
    description: 'A comprehensive analytics platform with real-time data visualization and reporting',
    tags: ['React', 'TypeScript', 'D3.js'],
    category: 'webapp',
    link: '#',
  },
  {
    id: 2,
    image: mobileImage,
    title: 'E-Commerce App',
    description: 'Modern shopping experience with seamless checkout and payment integration',
    tags: ['React Native', 'Node.js', 'Stripe'],
    category: 'mobile',
    link: '#',
  },
  {
    id: 3,
    image: aiImage,
    title: 'AI Content Platform',
    description: 'AI-powered content generation and optimization platform for marketers',
    tags: ['Python', 'OpenAI', 'FastAPI'],
    category: 'ai',
    link: '#',
  },
];

type Category = 'all' | 'webapp' | 'mobile' | 'ai';

export default function Portfolio() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const categories: Category[] = ['all', 'webapp', 'mobile', 'ai'];

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-16 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            {t('portfolioTitle')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('portfolioSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category)}
              data-testid={`button-filter-${category}`}
              className="min-w-[100px]"
            >
              {t(category)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProjects.map(project => (
            <PortfolioCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
