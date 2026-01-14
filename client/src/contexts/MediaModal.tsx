// @/contexts/MediaModal.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BannerMedia } from "@/types/blog";
import { Play, X } from "lucide-react";

interface MediaData {
    url: string;
    type?: 'image' | 'video' | 'gif' | 'embed' | 'slides' | 'doc' | 'html';
    alt?: string;
    thumbnail?: string;
    html?: string; // For raw SVG or HTML content
}

const MediaModalContext = createContext({
    showMedia: (media: string | MediaData) => { },
});

export const useMediaModal = () => useContext(MediaModalContext);

export function MediaModalProvider({ children }: { children: React.ReactNode }) {
    const [selectedMedia, setSelectedMedia] = useState<MediaData | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Helper: Convert YouTube/Vimeo URLs to embed URLs
    const getEmbedUrl = (url: string): string => {
        let embedUrl = url;
        // YouTube
        if (url.includes('youtube.com/watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/');
        } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
        }
        // Vimeo
        else if (url.includes('vimeo.com/')) {
            const vimeoId = url.split('/').pop();
            embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
        }
        return embedUrl;
    };

    // Auto-detect media type from URL
    const getMediaType = (url: string): MediaData['type'] => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
        if (lowerUrl.match(/\.(gif)$/)) return 'gif';
        if (lowerUrl.match(/\.(jpg|jpeg|png|webp|svg)$/)) return 'image';
        if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) return 'embed';
        if (lowerUrl.includes('slides.google.com') || lowerUrl.includes('slideshare.net')) return 'slides';
        if (lowerUrl.match(/\.(pdf|doc|docx|ppt|pptx)$/)) return 'doc';
        return 'image'; // default
    };

    // Parse media data
    const parseMedia = (media: string | MediaData): MediaData => {
        if (typeof media === 'string') {
            const type = getMediaType(media);
            return {
                url: type === 'embed' ? getEmbedUrl(media) : media,
                type,
                alt: 'Media preview'
            };
        }
        return {
            ...media,
            url: (media.type === 'embed' || getMediaType(media.url) === 'embed')
                ? getEmbedUrl(media.url)
                : media.url,
            type: media.type || getMediaType(media.url)
        };
    };

    const showMedia = (media: string | MediaData) => {
        setSelectedMedia(parseMedia(media));
        setIsVideoPlaying(false);
    };

    const closeModal = () => {
        setSelectedMedia(null);
        setIsVideoPlaying(false);
    };

    // Auto-detect clicks on images in the document
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Handle image clicks
            if (target.tagName === "IMG") {
                const imgSrc = (target as HTMLImageElement).src;
                const imgAlt = (target as HTMLImageElement).alt;

                if (target.closest('a') || target.classList.contains('no-modal')) return;

                showMedia({
                    url: imgSrc,
                    type: 'image',
                    alt: imgAlt || 'Image preview'
                });
            }

            // Handle Mermaid diagram clicks
            const mermaidParent = target.closest('.mermaid');
            if (mermaidParent) {
                const svg = mermaidParent.querySelector('svg');
                if (svg) {
                    showMedia({
                        url: '#',
                        type: 'html',
                        html: svg.outerHTML,
                        alt: 'Diagram preview'
                    });
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    const videoRef = React.useRef<HTMLVideoElement>(null);

    const handlePlayVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.play();
            setIsVideoPlaying(true);
        }
    };

    const renderMediaContent = () => {
        if (!selectedMedia) return null;

        const { url, type, alt, thumbnail } = selectedMedia;

        switch (type) {
            case 'video':
                return (
                    <div className="relative w-full h-full flex items-center justify-center bg-black/90 rounded-lg">
                        <video
                            ref={videoRef}
                            className="max-w-full max-h-[85vh] rounded-lg"
                            poster={thumbnail}
                            controls={isVideoPlaying}
                            autoPlay
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            preload="metadata"
                        >
                            <source src={url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        {!isVideoPlaying && (
                            <div
                                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                                onClick={handlePlayVideo}
                            >
                                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'gif':
            case 'image':
                return (
                    <img
                        src={url}
                        alt={alt || 'Media preview'}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                );

            case 'embed':
            case 'slides':
                const embedUrl = url;
                return (
                    <div className="w-full h-[85vh] bg-black/90 rounded-lg overflow-hidden relative">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={alt || 'Embedded content'}
                        />
                    </div>
                );

            case 'doc':
                // Check if it's a PDF (can be embedded)
                const isPDF = url.toLowerCase().endsWith('.pdf');

                if (isPDF) {
                    return (
                        <div className="w-full h-[85vh] bg-black/90 rounded-lg overflow-hidden flex flex-col">
                            <iframe
                                src={url}
                                className="w-full h-full"
                                title={alt || 'PDF Document'}
                            />
                            {/* Download button overlay */}
                            <div className="absolute bottom-4 right-4 z-10">
                                <a
                                    href={url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    );
                }

                // For other document types (DOC, PPT, etc.)
                return (
                    <div className="w-full h-[85vh] bg-muted/30 rounded-lg flex items-center justify-center p-8">
                        {thumbnail ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center">
                                <img
                                    src={thumbnail}
                                    alt={alt || 'Document preview'}
                                    className="max-w-full max-h-[70vh] object-contain mb-6"
                                />
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open Document
                                </a>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">📄</div>
                                <p className="text-lg text-muted-foreground mb-6">{alt || 'Document'}</p>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open Document
                                </a>
                            </div>
                        )}
                    </div>
                );

            case 'html':
                return (
                    <div
                        className="media-modal-html w-full h-full flex items-center justify-center p-4 bg-white/5 rounded-lg overflow-auto"
                        dangerouslySetInnerHTML={{ __html: selectedMedia.html || '' }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <MediaModalContext.Provider value={{ showMedia }}>
            {children}

            <Dialog open={!!selectedMedia} onOpenChange={closeModal}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none">
                    <div className="sr-only">
                        <h2>Media Preview</h2>
                        <p>{selectedMedia?.alt || 'Media content'}</p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    {renderMediaContent()}
                </DialogContent>
            </Dialog>
        </MediaModalContext.Provider>
    );
}

// Backward compatibility export
export const useImageModal = useMediaModal;
export const ImageModalProvider = MediaModalProvider;
