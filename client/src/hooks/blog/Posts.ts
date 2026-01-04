
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
            // Access externalSources (array) or sync_repo (string) dynamically
            const config = blogConfig as any;
            const externalSources = config?.externalSources as string[] | undefined;
            const singleRepo = config?.sync_repo as string | undefined;

            let reposToSync: string[] = [];

            if (externalSources && Array.isArray(externalSources)) {
                reposToSync = [...externalSources];
            } else if (singleRepo) {
                reposToSync = [singleRepo];
            }

            // Clean up list
            reposToSync = reposToSync.filter(url => url && url.trim() !== "");

            if (reposToSync.length > 0) {
                try {
                    console.log(`Syncing with repos: ${reposToSync.join(', ')}`);

                    // Create a timeout promise to prevent infinite loading
                    const timeout = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout syncing GitHub posts")), 5000)
                    );

                    const fetchPromise = Promise.all(
                        reposToSync.map(repo => fetchGitHubPosts(repo))
                    );

                    // Race against timeout
                    const allPostsResults = await Promise.race([fetchPromise, timeout]) as any[];

                    // Flatten results
                    const allGhPosts = allPostsResults.flat();

                    if (isMounted) {
                        // Combine static and dynamic posts
                        setPosts([...staticPosts, ...allGhPosts]);
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
