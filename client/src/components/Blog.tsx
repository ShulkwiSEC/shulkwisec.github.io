// Blog.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import BlogCard from './BlogCard';
import templateData from '@/data/template.json';

const getImagePath = (imagePath: string) => `/attached_assets/${imagePath}`;

export default function Blog() {
  const { t, language } = useLanguage();

  return (
    <section id="blog" className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">{t('blogTitle')}</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{t('blogSubtitle')}</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {templateData.blog.posts.map((post) => (
            <BlogCard
              key={post.id}
              image={getImagePath(post.image)}
              category={language === 'ar' ? post.category.ar : post.category.en}
              title={language === 'ar' ? post.title.ar : post.title.en}
              excerpt={language === 'ar' ? post.excerpt.ar : post.excerpt.en}
              date={post.date}
              readTime={post.readTime}
              link={`/post/${post.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
