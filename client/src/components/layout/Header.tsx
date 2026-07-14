import { Moon, Sun, Globe, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/Language';
import { useTheme } from '@/contexts/Theme';
import { siteConfig, achievements } from '@/lib/data';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useRafScroll } from '@/hooks/useRafScroll';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isShrunk, setIsShrunk] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [location] = useLocation();
  const currentPath = location;

  const trackRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    if (!achievements.length || !trackRef.current) return;

    const track = trackRef.current;
    let offset = language === 'ar' ? 0 : 0; // Will be adjusted in first frame
    let animationId: number;
    let lastHalfWidth = 0;
    const speed = 1.2;

    const animate = () => {
      if (!isPaused.current) {
        const halfWidth = track.scrollWidth / 2;

        if (halfWidth > 0) {
          // Detect if content changed or loaded and reset if necessary
          if (lastHalfWidth === 0) {
            lastHalfWidth = halfWidth;
            offset = 0;
          }

          offset -= speed;
          if (offset <= -halfWidth) offset = 0;

          track.style.transform = `translate3d(${offset}px, 0, 0)`;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
    };
  }, [achievements.length, language]);

  const getLinkClasses = (href: string) => {
    const baseClasses = "text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium pb-1";
    const activeClasses = "border-b-2 border-primary font-semibold inline-block";

    const normalizedCurrentPath = currentPath.endsWith('/') && currentPath !== '/' ? currentPath.slice(0, -1) : currentPath;
    const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;

    return `${baseClasses} ${normalizedCurrentPath === normalizedHref ? activeClasses : ''}`;
  };


  // Shrinking the header collapses ~200px of nav/achievements space, which
  // shifts the page layout below it — enough to move `scrollY` back across
  // the trigger on its own (via the browser's scroll-anchoring compensation,
  // or just the shift itself), re-flipping the state, which shifts layout
  // again, looping. Hysteresis alone isn't enough because the layout shift
  // can exceed the gap between thresholds. The lock below is the real fix:
  // once a flip happens, further flips are ignored until the transition
  // (--island-speed) has had time to fully settle, so a shift the flip
  // itself caused can never immediately trigger another flip.
  const lastFlipRef = useRef(0);
  useRafScroll(() => {
    setIsShrunk((prev) => {
      if (performance.now() - lastFlipRef.current < 700) return prev;
      const y = window.scrollY;
      const next = prev ? y > 40 : y > 120;
      if (next !== prev) lastFlipRef.current = performance.now();
      return next;
    });
  });

  return (
    <header
      className={`will-animate sticky top-0 z-50 transition-all ${isShrunk ? 'py-2 bg-primary/[0.06] backdrop-blur-xl border-b border-primary/15 shadow-sm' : 'py-4 sm:py-6 bg-transparent border-b border-transparent'}`}
      style={{
        paddingTop: `calc(var(--safe-top) + ${isShrunk ? '0.5rem' : '1rem'})`,
        transitionDuration: 'var(--island-speed)',
        transitionTimingFunction: 'var(--island-ease)',
        // Stop the browser from "helpfully" adjusting scrollY to compensate
        // for the header's own animated height change — that compensation
        // is what was fighting our threshold and causing the flicker.
        overflowAnchor: 'none',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className={`flex flex-col transition-[gap] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'gap-0' : 'gap-1'
            }`}>
            <h1 className={`font-display font-bold transition-[font-size] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl font-black'
              }`}>
              <Link
                href="/"
                className="transition-colors duration-300"
              >
                {siteConfig.title[language]}
              </Link>
            </h1>

            {/* Subtitle with joint collapse effect */}
            <div
              className={`overflow-hidden transition-[max-height,opacity] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
                }`}
            >
              <p className="text-muted-foreground text-xs sm:text-sm">
                {siteConfig.subtitle[language]}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center transition-[gap] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'gap-1' : 'gap-2'
            }`}>
            {/* Language Selector */}
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsLangOpen(!isLangOpen)}
                data-testid="button-language-toggle"
                className={`transition-[height,width] duration-[var(--island-speed)] ease-[var(--island-ease)] hover:scale-105 hover:bg-accent ${isShrunk ? 'h-8 w-8' : 'h-9 w-9'
                  }`}
              >
                <Globe className={`transition-[height,width] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
              </Button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[100px] w-auto rounded-md shadow-lg bg-popover focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200 border border-popover-border">
                  <div className="py-1">
                    {((siteConfig as any).languages || ['en', 'ar']).map((lang: string) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm whitespace-nowrap hover:bg-accent hover:text-accent-foreground transition-colors ${language === lang ? 'font-bold text-primary' : 'text-popover-foreground'
                          }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className={`transition-[height,width] duration-[var(--island-speed)] ease-[var(--island-ease)] hover:scale-110 hover:bg-accent hover:rotate-180 ${isShrunk ? 'h-8 w-8' : 'h-9 w-9'
                }`}
            >
              {theme === 'dark' ? (
                <Sun className={`transition-[height,width] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
              ) : (
                <Moon className={`transition-[height,width] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk ? 'h-4 w-4' : 'h-5 w-5'
                  }`} />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation with joint accordion effect */}
        <nav
          className={`overflow-hidden transition-[max-height,opacity,margin-top] duration-[var(--island-speed)] ease-[var(--island-ease)] ${isShrunk
            ? 'max-h-0 opacity-0 mt-0'
            : 'max-h-48 opacity-100 mt-4'
            }`}>
          <ul className="flex gap-4 sm:gap-6 text-sm sm:text-base overflow-x-auto whitespace-nowrap scrollbar-none px-1">
            <li className="transform transition-all duration-300 hover:scale-105">
              <Link
                href="/"
                className={getLinkClasses('/')}
                data-testid="link-home"
              >
                {t('home')}
              </Link>
            </li>
            <li className="transform transition-all duration-300 hover:scale-105">
              <Link
                href="/about"
                className={getLinkClasses('/about')}
                data-testid="link-about"
              >
                {t('about')}
              </Link>
            </li>
            {siteConfig.external && siteConfig.external.map((link: { name: Record<string, string>; url: string }, index: number) => (
              <li key={index} className="transform transition-all duration-300 hover:scale-105">
                <Link
                  href={link.url}
                  className={getLinkClasses(link.url)}
                >
                  {link.name[language]}
                </Link>
              </li>
            ))}
          </ul>
          {achievements && achievements.length > 0 && (
            <div className="tinker-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="tinker-label" style={{ zIndex: 2 }}>
                <Trophy size={14} className="fill-current" />
                <span>{t('achievementsLabel')}</span>
              </div>
              <div
                className="flex-1 overflow-hidden scroll-mask"
                onMouseEnter={() => { isPaused.current = true; }}
                onMouseLeave={() => { isPaused.current = false; }}
                style={{ direction: 'ltr' }}
              >
                <div
                  ref={trackRef}
                  className="tinker-track"
                  style={{ position: 'relative', left: 0 }}
                >
                  {[...achievements, ...achievements].map((achievement, idx) => (
                    <div key={idx} className="flex items-center shrink-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <a
                        href={achievement.fallback}
                        className="tinker-item"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <span className="tinker-title">{achievement.title[language]}</span>
                        <span className="tinker-subtitle ms-2">
                          {achievement.subtitle[language]}
                        </span>
                      </a>
                      <div className="tinker-dot" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}