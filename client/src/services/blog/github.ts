
import { BlogPost } from '@/types/blog';

interface GitHubTreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size?: number;
    url: string;
}

interface GitHubTreeResponse {
    sha: string;
    url: string;
    tree: GitHubTreeItem[];
    truncated: boolean;
}

interface GitHubRepoInfo {
    default_branch: string;
}

export async function fetchGitHubPosts(repoUrl: string): Promise<BlogPost[]> {
    try {
        // 1. Parse Repo URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return [];
        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\/$/, '').replace(/\.git$/, '');

        // 2. Get Default Branch
        const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`);
        if (!repoInfoRes.ok) {
            console.error("Failed to fetch repo info:", repoInfoRes.statusText);
            return [];
        }
        const repoInfo: GitHubRepoInfo = await repoInfoRes.json();
        const defaultBranch = repoInfo.default_branch;

        // 3. Get Repo Tree
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/${defaultBranch}?recursive=1`);
        if (!treeRes.ok) {
            console.error("Failed to fetch repo tree:", treeRes.statusText);
            return [];
        }
        const treeData: GitHubTreeResponse = await treeRes.json();

        // 4. Find valid READMEs 
        // We want to skip the root README if it just describes the repo, or maybe include it depending on preference.
        // The user's example implies subdirectory READMEs are the writeups.
        const readmeFiles = treeData.tree.filter(item =>
            item.path.endsWith('README.md') && item.type === 'blob'
        );

        // 5. Fetch content (limit concurrency if needed, but for now simple Promise.all)
        const posts = await Promise.all(readmeFiles.map(async (file) => {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${cleanRepo}/${defaultBranch}/${file.path}`;

            try {
                const contentRes = await fetch(rawUrl);
                if (!contentRes.ok) return null;
                let content = await contentRes.text();

                // 6. Rewrite relative image links
                const parentDirUrl = rawUrl.substring(0, rawUrl.lastIndexOf('/'));

                // Match Markdown images: ![alt](url)
                content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
                    if (src.includes('://') || src.startsWith('//')) return match;
                    // Handle relative paths. Normalize isn't available in browser JS easily without polyfill/hack, 
                    // but URL constructor handles .. resolution relatively well.
                    try {
                        const absUrl = new URL(src, parentDirUrl + '/').href;
                        return `![${alt}](${absUrl})`;
                    } catch (e) {
                        return match;
                    }
                });

                // Match HTML images: <img src="url" ...>
                content = content.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/g, (match, pre, src, post) => {
                    if (src.includes('://') || src.startsWith('//')) return match;
                    try {
                        const absUrl = new URL(src, parentDirUrl + '/').href;
                        return `<img${pre}src="${absUrl}"${post}>`;
                    } catch (e) {
                        return match;
                    }
                });

                // Generate Meta
                const dirPath = file.path.substring(0, file.path.lastIndexOf('/'));
                // If it's root README (dirPath is empty string), title is just Repo Name
                const title = dirPath ? `${cleanRepo}/${dirPath}` : cleanRepo;

                // Extract first 2 meaningful lines for excerpt
                const lines = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && !line.startsWith('![')) // Skip empty lines and images
                    .slice(0, 2)
                    .map(line => line.replace(/^#+\s*/, '').replace(/[*_~`]/g, '')); // Basic markdown strip

                const preview = lines.join(' ');

                // Generate a stable ID. 
                // We use the full path, replace slashes with dashes.
                const idPath = file.path.replace(/\//g, '-').replace('.md', '').toLowerCase();
                const id = `gh-${owner}-${cleanRepo}-${idPath}`;

                return {
                    id,
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), // Fallback date
                    title: {
                        ar: title,
                        en: title
                    }, // As requested: repo/folder...
                    excerpt: {
                        en: `Imported from ${cleanRepo} - ${preview}`,
                        ar: `Imported from ${cleanRepo} - ${preview}`,
                        "zh-cn": `Imported from ${cleanRepo} - ${preview}`
                    },
                    content,
                    tags: ['GitHub', cleanRepo],
                    encoding: false,
                    pin: false
                } as BlogPost;

            } catch (err) {
                console.error(`Failed to fetch content for ${file.path}`, err);
                return null;
            }
        }));

        // Filter out nulls
        return posts.filter((p): p is BlogPost => p !== null);

    } catch (error) {
        console.error("Error fetching GitHub posts:", error);
        return [];
    }
}
