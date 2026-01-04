import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/Language';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
    title: string;
    text?: string;
    url?: string;
    className?: string;
    variant?: 'ghost' | 'outline' | 'default';
    showLabel?: boolean;
}

export default function ShareButton({
    title,
    text,
    url,
    className,
    variant = 'ghost',
    showLabel = false
}: ShareButtonProps) {
    const { t } = useLanguage();
    const { toast } = useToast();

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const shareData = {
            title: title,
            text: text || title,
            url: url || window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast({
                    title: t('LinkCopied') || 'Link Copied',
                    description: t('LinkCopiedDesc') || 'Blog post link copied to clipboard.',
                });
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <Button
            variant={variant}
            size="sm"
            className={cn("gap-2", className)}
            onClick={handleShare}
            title={t('Share') || 'Share'}
        >
            <Share2 className="w-4 h-4" />
            {showLabel && (
                <span className="hidden sm:inline">{t('Share') || 'Share'}</span>
            )}
        </Button>
    );
}
