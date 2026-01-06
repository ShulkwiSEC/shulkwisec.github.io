import { Moon, Sun, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/Language';
import { useTheme } from '@/contexts/Theme';
import { siteConfig } from '@/lib/data';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Link } from 'wouter';

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isShrunk, setIsShrunk] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [location] = useLocation();
  const currentPath = location;

  const getLinkClasses = (href: string) => {
    const baseClasses = "text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium pb-1";
    const activeClasses = "border-b-2 border-blue-500 font-semibold inline-block";

    const normalizedCurrentPath = currentPath.endsWith('/') && currentPath !== '/' ? currentPath.slice(0, -1) : currentPath;
    const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;

    return `${baseClasses} ${normalizedCurrentPath === normalizedHref ? activeClasses : ''}`;
  };


  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 80) {
      setIsShrunk(true);
    } else {
      setIsShrunk(false);
    }
  }, []);

  const debouncedHandleScroll = debounce(handleScroll, 100);

  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

  return (
    <header
      className="sticky top-0 z-[60] w-full pointer-events-none will-animate"
      style={{
        paddingTop: `var(--safe-top)`,
        transition: 'padding var(--island-speed) var(--island-ease)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl flex justify-center">
        <div
          className={`
            pointer-events-auto flex items-center justify-between gap-4 px-5 sm:px-8
            transition-all duration-700 ease-[var(--island-ease)] will-animate
            ${isShrunk
              ? 'mt-3 w-auto min-w-[300px] h-14 rounded-[2.5rem] bg-background/85 backdrop-blur-2xl border border-white/15 dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
              : 'w-full h-24 rounded-3xl bg-background/60 backdrop-blur-xl border border-transparent shadow-none'
            }
          `}
        >
          {/* Brand/Logo - Left Docked */}
          <div className="flex flex-col flex-shrink-0">
            <h1 className={`font-bold tracking-tight transition-all duration-700 ease-[var(--island-ease)] ${isShrunk ? 'text-lg' : 'text-2xl sm:text-3xl'
              }`}>
              <Link
                href="/"
                className="hover:text-primary transition-colors duration-300 transform active:scale-95 inline-block"
              >
                {siteConfig.title[language]}
              </Link>
            </h1>
          </div>

          {/* Dynamic Spacer */}
          <div className={`transition-all duration-700 ease-[var(--island-ease)] ${isShrunk ? 'w-4 sm:w-12' : 'flex-grow'}`} />

          {/* Action Island - Right Docked */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all active:scale-90"
              >
                <Globe className="h-5 w-5" />
              </Button>

              {isLangOpen && (
                <div className="absolute end-0 top-full mt-4 min-w-[130px] rounded-2xl shadow-2xl bg-popover/95 backdrop-blur-2xl border border-border p-2 animate-in fade-in slide-in-from-top-2 duration-300 z-[70]">
                  {((siteConfig as any).languages || ['en', 'ar']).map((lang: string) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLangOpen(false);
                      }}
                      className={`block w-full text-center px-4 py-2.5 text-sm rounded-xl transition-all ${language === lang
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'hover:bg-accent text-popover-foreground'
                        }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all group active:scale-90"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-12" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation - Professional Staggered Assembly */}
      <nav
        className={`mt-4 px-4 flex justify-center overflow-hidden transition-all duration-700 ease-[var(--island-ease)] ${isShrunk ? 'max-h-0 opacity-0 -translate-y-8 pointer-events-none' : 'max-h-24 opacity-100 translate-y-0'
          }`}
      >
        <ul
          className="flex items-center gap-2 sm:gap-4 text-sm font-medium bg-background/50 backdrop-blur-2xl px-5 py-3 rounded-[1.5rem] border border-white/10 dark:border-white/5 shadow-xl overflow-x-auto scrollbar-none whitespace-nowrap max-w-full scroll-mask will-animate"
          style={{ pointerEvents: 'auto' }}
        >
          {[
            { label: t('home'), href: '/' },
            { label: t('about'), href: '/about' },
            ...(siteConfig.external || []).map((link: any) => ({ label: link.name[language], href: link.url }))
          ].map((item, i) => (
            <li
              key={i}
              className="flex-shrink-0 transition-all duration-700 ease-[var(--island-ease)]"
              style={{
                transitionDelay: isShrunk ? '0ms' : `${i * 50}ms`,
                transform: isShrunk ? 'scale(0.8) translateY(-10px)' : 'scale(1) translateY(0)',
                opacity: isShrunk ? 0 : 1
              }}
            >
              <Link href={item.href} className={getLinkClasses(item.href)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}