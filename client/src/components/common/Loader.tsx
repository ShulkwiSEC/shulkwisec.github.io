import { motion } from 'framer-motion';
import { ownerConfig } from '@/lib/data';
import { useLanguage } from '@/contexts/Language';
import { useEffect, useState } from 'react';

export default function Loader() {
    const { language } = useLanguage();
    const [progress, setProgress] = useState(0);

    // Resolve localized strings
    const name = ownerConfig.name[language] || ownerConfig.name['en'] || "Sahb";
    const bio = ownerConfig.bio[language] || ownerConfig.bio['en'] || "Developer & Researcher";

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                const diff = Math.random() * 8;
                return Math.min(prev + diff, 100);
            });
        }, 120);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-[9999]">
            <div className="max-w-md w-full px-8 text-center">
                {/* Minimalist Word-based Reveal */}
                <div className="overflow-hidden mb-4">
                    <div className="flex flex-wrap justify-center gap-x-3">
                        {name.split(" ").map((word, index) => (
                            <div key={index} className="overflow-hidden">
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: 0.1 * index,
                                        ease: [0.16, 1, 0.3, 1], // easeOutExpo
                                    }}
                                    className="text-3xl py-5 md:text-5xl font-bold text-foreground inline-block leading-tight"
                                >
                                    {word}
                                </motion.span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subdued Bio */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-sm md:text-base text-muted-foreground font-medium tracking-wide mb-8"
                >
                    {bio}
                </motion.p>

                {/* Simple Progress Bar (Matches Skeleton theme) */}
                <div className="relative w-full max-w-[200px] h-[1px] bg-border mx-auto overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: `${progress - 100}%` }}
                        transition={{ ease: "linear" }}
                        className="absolute inset-0 bg-primary"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium"
                >
                    Initialising {Math.round(progress)}%
                </motion.div>
            </div>
        </div>
    );
}
