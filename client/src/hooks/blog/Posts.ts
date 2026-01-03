
import { useState, useEffect } from 'react';
import { BlogPost } from '@/types/blog';
import { blogPosts as staticPosts, blogConfig } from '@/lib/data';
import { fetchGitHubPosts } from '@/services/blog/github';

export const useBlogPosts = () => {
    const [posts, setPosts] = useState<BlogPost[]>(staticPosts);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            // Access sync_repo dynamically
            const syncRepo = (blogConfig as any)?.sync_repo;

            if (syncRepo && typeof syncRepo === 'string') {
                try {
                    console.log(`Syncing with repo: ${syncRepo}`);
                    const ghPosts = await fetchGitHubPosts(syncRepo);
                    if (isMounted) {
                        // Merge posts, preventing duplicates if any (though IDs should differ)
                        setPosts([...staticPosts, ...ghPosts]);
                    }
                } catch (error) {
                    console.error("Failed to sync GitHub posts", error);
                }
            }
            if (isMounted) setLoading(false);
        };

        loadPosts();

        return () => {
            isMounted = false;
        };
    }, []);

    return { posts, loading };
};
