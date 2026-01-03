import { useState, useEffect } from 'react';

const STORAGE_KEY = 'shulkwisec_read_later';

export function useReadLater() {
    const [savedPosts, setSavedPosts] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSavedPosts(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse read later posts', e);
            }
        }
    }, []);

    // Save to localStorage whenever savedPosts changes
    const toggleSavePost = (postId: string) => {
        setSavedPosts(prev => {
            const isSaved = prev.includes(postId);
            const newValue = isSaved
                ? prev.filter(id => id !== postId)
                : [...prev, postId];

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
            return newValue;
        });
    };

    const isSaved = (postId: string) => savedPosts.includes(postId);

    return { savedPosts, toggleSavePost, isSaved };
}
