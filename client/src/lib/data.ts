import templateData from '@/data/template.json';
import { BlogPost } from '@/types/blog';
import {
    SiteConfig,
    OwnerConfig,
    Achievement,
    AboutConfig,
    CommentsConfig
} from '@/types/config';

function decodeContent(content: string, encoding: boolean | undefined): string {
    if (encoding !== false) {
        try {
            return decodeURIComponent(escape(atob(content)));
        } catch (e) {
            console.error('Failed to decode content', e);
            return content;
        }
    }
    return content;
}

export const blogPosts: BlogPost[] = templateData.blog.posts.map((post: any) => ({
    id: post.id,
    date: post.date,
    title: post.title,
    excerpt: post.excerpt,
    content: decodeContent(post.content, post.encoding),
    banner: post.banner,
    tags: post.tags,
    encoding: post.encoding,
    pin: post.pin === true
}));

export const siteConfig: SiteConfig = templateData.site as SiteConfig;
export const commentsConfig: CommentsConfig = templateData.site.comments as CommentsConfig;
export const ownerConfig: OwnerConfig = templateData.owner as OwnerConfig;
export const achievements: Achievement[] = templateData.achievements as Achievement[];
export const aboutConfig: AboutConfig = templateData.about as AboutConfig;
export const blogConfig = templateData.blog;

export const swipeableRoutes: string[] = (() => {
    const configured = templateData.site.swipeableRoutes || [];
    if (configured.includes("*")) {
        const routes = ["/", "/about"];
        if (templateData.site.external) {
            templateData.site.external.forEach((link: any) => {
                if (link.url && !routes.includes(link.url)) {
                    routes.push(link.url);
                }
            });
        }
        return routes;
    }
    return configured;
})();

export default templateData;
