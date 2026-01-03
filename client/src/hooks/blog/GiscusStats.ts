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
            const params = new URLSearchParams({
                repo,
                term,
                category,
            });

            // detailed: "https://corsproxy.io/?<TARGET_URL>"
            const targetUrl = `https://giscus.app/api/discussions?${params.toString()}`;
            const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);

            if (response.status === 404) {
                return { totalCommentCount: 0, reactionsCount: 0 };
            }

            if (!response.ok) {
                throw new Error('Failed to fetch giscus stats');
            }

            const data: GiscusResponse = await response.json();

            const reactionsCount = data.discussion?.reactions
                ? Object.values(data.discussion.reactions).reduce((acc, curr) => acc + curr.count, 0)
                : 0;

            return {
                totalCommentCount: data.discussion?.totalCommentCount || 0,
                reactionsCount,
            };
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false,
    });
}
