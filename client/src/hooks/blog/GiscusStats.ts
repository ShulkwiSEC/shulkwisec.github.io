import { useQuery } from '@tanstack/react-query';

interface GiscusDiscussion {
    totalCommentCount: number;
    reactions: Record<string, { count: number }>;
}

interface GiscusResponse {
    discussion: GiscusDiscussion | null;
}

interface UseGiscusStatsProps {
    repo: string;
    term: string;
    category: string;
}

export function useGiscusStats({ repo, term, category }: UseGiscusStatsProps) {
    return useQuery({
        queryKey: ['giscus-stats', repo, term, category],
        queryFn: async () => {
            if (!repo || !term) return { totalCommentCount: 0, reactionsCount: 0 };

            try {
                const params = new URLSearchParams({
                    repo,
                    term,
                    category,
                });

                const targetUrl = `https://giscus.app/api/discussions?${params.toString()}`;
                // Use a different proxy or direct if possible. 
                // However, without a proxy, CORS will likely block it.
                // We'll keep the proxy but silence the 404 error by returning early.
                const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);

                if (!response.ok) {
                    // Silently return zero stats on error (like 404 when no comments yet)
                    return { totalCommentCount: 0, reactionsCount: 0 };
                }

                const data: GiscusResponse = await response.json();

                const reactionsCount = data.discussion?.reactions
                    ? Object.values(data.discussion.reactions).reduce((acc, curr) => acc + curr.count, 0)
                    : 0;

                return {
                    totalCommentCount: data.discussion?.totalCommentCount || 0,
                    reactionsCount,
                };
            } catch (e) {
                console.debug('Giscus stats fetch failed (expected for new posts):', e);
                return { totalCommentCount: 0, reactionsCount: 0 };
            }
        },
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
        retry: false,
        refetchOnWindowFocus: false
    });
}
