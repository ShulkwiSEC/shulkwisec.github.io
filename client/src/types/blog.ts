export interface BlogPost {
    id: string;
    date: string;
    title: Record<string, string>;
    excerpt: Record<string, string>;
    content: string;
    banner?: string;
    tags?: string[];
    encoding?: boolean;
    pin?: boolean;
}
