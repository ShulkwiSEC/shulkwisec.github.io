import { useState, useMemo } from 'react';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleBlogPost from '@/components/SimpleBlogPost';
import SimpleFooter from '@/components/SimpleFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts } from '@/data/blogPosts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SimpleBlog() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredAndSortedPosts = useMemo(() => {
    return blogPosts
      .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [searchTerm, sortOrder]);

  return (
    <div className="min-h-screen flex flex-col [perspective:1000px]">
      <SimpleHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <div className="flex justify-between items-center mb-8">
          <Input
            type="text"
            placeholder={t('filterByTitle')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('sortByDate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('newestFirst')}</SelectItem>
              <SelectItem value="oldest">{t('oldestFirst')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-12">
          {filteredAndSortedPosts.map(post => (
            <SimpleBlogPost
              key={post.id}
              date={post.date}
              title={post.title}
              excerpt={post.excerpt}
              link={`/post/${post.id}`}
            />
          ))}
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
}