import React, { useEffect } from 'react';
import { Eye } from 'lucide-react';
import { usePostViews } from '@/hooks/blog/Views';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/Language';

interface ViewsProps {
    postId: string;
    shouldIncrement?: boolean;
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    showLabel?: boolean;
}

export default function Views({
    postId,
    shouldIncrement = false,
    className,
    variant = 'ghost',
    showLabel = false
}: ViewsProps) {
    if (!postId) return null;

    const { views, isLoading, increment } = usePostViews(postId);
    const { t } = useLanguage();

    useEffect(() => {
        if (shouldIncrement) {
            increment();
        }
    }, [postId, shouldIncrement]); // Only run once per postId or if flags change

    if (isLoading) {
        return <Skeleton className="h-4 w-12" />;
    }

    return (
        <div className={cn(
            "flex items-center gap-1.5 text-muted-foreground text-sm h-9 px-3 rounded-md border border-transparent transition-colors",
            variant === 'outline' && "border-border hover:bg-accent",
            variant === 'default' && "bg-primary text-primary-foreground",
            className
        )}>
            <Eye className="w-4 h-4" />
            <span className="font-medium whitespace-nowrap">
                {views.toLocaleString()} <span className={cn(showLabel ? "hidden sm:inline" : "hidden")}>{t('views') || 'Views'}</span>
            </span>
        </div>
    );
}
