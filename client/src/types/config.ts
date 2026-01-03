export interface SiteConfig {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    description: Record<string, string>;
    languages: string[];
    pagination_per_page?: number;
    external?: ExternalLink[];
    comments?: CommentsConfig;
    swipeableRoutes?: string[];
    url: string;
}

export interface ExternalLink {
    name: Record<string, string>;
    url: string;
}

export interface CommentsConfig {
    provider: string;
    giscus: Record<string, string>;
}

export interface OwnerConfig {
    name: Record<string, string>;
    bio: Record<string, string>;
    email: string;
    social: {
        github: string;
        twitter: string;
        linkedin: string;
    };
}

export interface Achievement {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    fallback: string;
}

export interface AboutConfig {
    aboutTitle: Record<string, string>;
    aboutText: Record<string, string>;
    bio: Record<string, string>;
    skills: {
        title: Record<string, string>;
        items: Array<{
            name: string;
            value: string | Record<string, string>;
        }>;
    };
    contact: {
        title: Record<string, string>;
        links: Array<{
            name: string;
            icon: string;
            url: string;
        }>;
    };
}
