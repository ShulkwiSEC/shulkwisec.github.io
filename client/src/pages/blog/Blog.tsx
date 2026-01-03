import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import BlogItem from '@/components/features/blog/BlogItem';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/layout/SEO';
import { useLanguage } from '@/contexts/Language';
import { useBlogPosts } from '@/hooks/blog/Posts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { siteConfig, blogPosts } from '@/lib/data';
import { BlogPost } from '@/types/blog';
import { useReadLater } from '@/hooks/blog/ReadLater';
import { Bookmark } from 'lucide-react';

export default function SimpleBlog() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const { posts: blogPosts, loading } = useBlogPosts();
  const { savedPosts } = useReadLater();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = siteConfig.pagination_per_page || 6;

  // Handle URL parameters for App Shortcuts (e.g., /?saved=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('saved') === 'true') {
      setShowSavedOnly(true);
    }
  }, []);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, sortOrder, showSavedOnly]);

  const allTags = useMemo(() => {
    const tags = new Set(blogPosts.flatMap((post: BlogPost) => post.tags || []));
    return ['all', ...Array.from(tags)];
  }, [blogPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    return blogPosts
      .filter((post: BlogPost) => {
        const title = post.title[language] || post.title['en'] || Object.values(post.title)[0] || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = selectedTag === 'all' || (post.tags && post.tags.includes(selectedTag));
        const matchesSaved = !showSavedOnly || savedPosts.includes(post.id);
        return matchesSearch && matchesTag && matchesSaved;
      })
      .sort((a: BlogPost, b: BlogPost) => {
        // Pinned posts first
        const aPinned = a.pin === true;
        const bPinned = b.pin === true;
        if (aPinned !== bPinned) return aPinned ? -1 : 1;

        // Then by date per selected order
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [searchTerm, selectedTag, sortOrder, showSavedOnly, blogPosts, language, savedPosts]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const currentPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col [perspective:1000px]">
      <SEO canonicalPath="/" />
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
            <div className="flex gap-2 flex-1">
              <Input
                type="text"
                placeholder={t('filterByTitle')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-xs"
              />
              <Button
                variant={showSavedOnly ? "default" : "outline"}
                size="icon"
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                title={t('SavedPosts')}
                className="shrink-0"
              >
                <Bookmark className={showSavedOnly ? "fill-current" : ""} size={18} />
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag === 'all' ? t('allTags') || 'All Tags' : tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={t('sortByDate')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('newestFirst')}</SelectItem>
                  <SelectItem value="oldest">{t('oldestFirst')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Active Filters Display */}
          {(selectedTag !== 'all' || showSavedOnly) && (
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              {selectedTag !== 'all' && (
                <div>
                  Filtering by tag: <span className="font-semibold text-primary">{selectedTag}</span>
                </div>
              )}
              {showSavedOnly && (
                <div>
                  <span className="font-semibold text-primary">{t('SavedPosts')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-12">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : currentPosts.length > 0 ? (
            currentPosts.map((post: BlogPost) => (
              <BlogItem
                key={post.id}
                id={post.id}
                date={post.date}
                title={post.title[language] || post.title['en'] || Object.values(post.title)[0] || ''}
                excerpt={post.excerpt[language] || post.excerpt['en'] || Object.values(post.excerpt)[0] || ''}
                link={`/post/${post.id}`}
                pin={post.pin}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {showSavedOnly ? t('NoSavedPosts') || 'No saved posts yet.' : 'No posts found.'}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
