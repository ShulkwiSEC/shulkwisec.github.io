import { Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/Language';
import { ownerConfig } from '@/lib/data';
import React, { useState, useEffect } from 'react';

export default function Footer() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      // Check if user is near bottom (within 200px)
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (distanceFromBottom < 200) {
        setIsVisible(true);
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }

      // Always visible once page is loaded
      if (scrollTop > 100) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer
      className={`border-t mt-16 transition-all duration-700 ease-in-out [transform-style:preserve-3d] [transform-origin:top] ${isVisible ? 'opacity-100 rotate-x-0' : 'opacity-0 [-webkit-transform:rotateX(-90deg)] [transform:rotateX(-90deg)]'
        }`}
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >

      {/* Main Footer Content */}
      <div className={`container mx-auto px-4 sm:px-6 max-w-3xl transition-all duration-700 ease-in-out ${isExpanded ? 'py-8' : 'py-6'
        }`}>
        <div className={`flex flex-col sm:flex-row justify-between items-center transition-all duration-700 ease-in-out ${isExpanded ? 'gap-6' : 'gap-4'
          }`}>
          {/* Credit Section */}
          <div
            className={`flex items-center gap-2 transition-all duration-700 ease-in-out ${isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-80'
              }`}
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              {t('builtBy')}
              <span className="font-semibold text-foreground hover:text-primary transition-colors duration-300">
                Shulkwisec
              </span>
            </p>
          </div>

          {/* Social Links */}
          <div className={`flex transition-all duration-700 ease-in-out ${isExpanded ? 'gap-6' : 'gap-4'
            }`}>
            <a
              href={ownerConfig.social.github}
              className={`text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${isExpanded ? 'opacity-100' : 'opacity-80'
                }`}
              aria-label="GitHub"
              data-testid="link-github"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className={`transition-all duration-700 ease-in-out ${isExpanded ? 'w-6 h-6' : 'w-5 h-5'
                }`} />
            </a>
            <a
              href={ownerConfig.social.twitter}
              className={`text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${isExpanded ? 'opacity-100' : 'opacity-80'
                }`}
              aria-label="Twitter"
              data-testid="link-twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className={`transition-all duration-700 ease-in-out ${isExpanded ? 'w-6 h-6' : 'w-5 h-5'
                }`} />
            </a>
            <a
              href={ownerConfig.social.linkedin}
              className={`text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-125 hover:-translate-y-1 ${isExpanded ? 'opacity-100' : 'opacity-80'
                }`}
              aria-label="LinkedIn"
              data-testid="link-linkedin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className={`transition-all duration-700 ease-in-out ${isExpanded ? 'w-6 h-6' : 'w-5 h-5'
                }`} />
            </a>
          </div>
        </div>

        {/* Copyright or Additional Info - Joint collapse */}
        <div
          className={`transition-all duration-700 ease-in-out ${isExpanded
            ? 'max-h-20 opacity-100 mt-6'
            : 'max-h-0 opacity-0 mt-0'
            }`}
        >
          <div className="text-center pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Shulkwisec. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}