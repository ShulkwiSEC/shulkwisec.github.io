import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useReadLater } from '@/hooks/blog/ReadLater';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/Language';

interface SaveButtonProps {
    postId: string;
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    showLabel?: boolean;
}

export default function SaveButton({
    postId,
    className,
    variant = 'ghost',
    showLabel = false
}: SaveButtonProps) {
    const { toggleSavePost, isSaved } = useReadLater();
    const { t } = useLanguage();
    const saved = isSaved(postId);

    return (
        <Button
            variant={variant}
            size="sm"
            className={cn(
                "gap-2 transition-all duration-300",
                saved ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground",
                className
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSavePost(postId);
            }}
            title={saved ? "Remove from Read Later" : "Add to Read Later"}
        >
            {saved ? (
                <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
                <Bookmark className="w-4 h-4" />
            )}
            {showLabel && (
                <span>{saved ? t('Saved') : t('ReadLater')}</span>
            )}
        </Button>
    );
}
