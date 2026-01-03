import { useState, useEffect } from 'react';
import { siteConfig } from '@/lib/data';

declare global {
    interface Window {
        counterApi: {
            read: (key: string, action: string, namespace: string, options: any, callback: (err: any, res: any) => void) => void;
            increment: (key: string, action: string, namespace: string, options: any, callback: (err: any, res: any) => void) => void;
        };
    }
}

const NAMESPACE = new URL(siteConfig.url).hostname;
const ACTION = 'view';

export function usePostViews(postId: string) {
    const [views, setViews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchViews = () => {
        if (!window.counterApi) return;

        window.counterApi.read(postId, ACTION, NAMESPACE, {}, (err, res) => {
            if (!err && res) {
                setViews(res.value || 0);
            }
            setIsLoading(false);
        });
    };

    const increment = () => {
        const executeIncrement = () => {
            window.counterApi.increment(postId, ACTION, NAMESPACE, {}, (err, res) => {
                if (!err && res) {
                    setViews(res.value || 0);
                }
            });
        };

        if (window.counterApi) {
            executeIncrement();
        } else {
            const check = setInterval(() => {
                if (window.counterApi) {
                    executeIncrement();
                    clearInterval(check);
                }
            }, 100);
            setTimeout(() => clearInterval(check), 5000); // safety
        }
    };

    useEffect(() => {
        if (!postId) return;

        const checkApi = setInterval(() => {
            if (window.counterApi) {
                fetchViews();
                clearInterval(checkApi);
            }
        }, 100);

        // Real-time updates every 30 seconds
        const interval = setInterval(fetchViews, 30000);

        return () => {
            clearInterval(checkApi);
            clearInterval(interval);
        };
    }, [postId]);

    return { views, isLoading, increment };
}
