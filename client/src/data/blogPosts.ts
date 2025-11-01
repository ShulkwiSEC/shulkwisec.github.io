import templateData from './template.json';

export interface BlogPost {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  banner?: string;
  tags?: string[];
  encoding?: boolean;
}

function decodeContent(content: string, encoding: boolean | undefined) {
  if (encoding !== false) { // Default to true if encoding is not explicitly false
    try {
      return decodeURIComponent(escape(atob(content)));
    } catch (e) {
      console.error('Failed to decode content', e);
      return content;
    }
  } 
  return content;
}


export const blogPosts: BlogPost[] = templateData.blog.posts.map(post => ({
  id: post.id,
  date: post.date,
  title: post.title.ar + ' | ' + post.title.en,
  excerpt: post.excerpt.ar,
  content: decodeContent(post.content, post.encoding),
  banner: post.banner,
  tags: post.tags,
  encoding: post.encoding
}));

export const siteConfig = templateData.site;
export const ownerConfig = templateData.owner;
export const achievements = templateData.achievements;
export const aboutConfig = templateData.about;
export const swipeableRoutes = templateData.site.swipeableRoutes;