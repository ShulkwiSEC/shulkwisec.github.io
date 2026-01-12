export interface BannerMedia {
    url: string;
    type?: 'image' | 'video' | 'gif' | 'embed' | 'slides' | 'doc';
    alt?: string;
    thumbnail?: string; // For videos or documents
}

export interface BlogPost {
    id: string;
    date: string;
    title: Record<string, string>;
    excerpt: Record<string, string>;
    content: string;
    banner?: string | BannerMedia; // Support both simple string and rich media object
    tags?: string[];
    encoding?: boolean;
    pin?: boolean;
}
