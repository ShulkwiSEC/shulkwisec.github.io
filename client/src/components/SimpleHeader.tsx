import { Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { siteConfig } from '@/data/blogPosts';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'wouter';

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export default function SimpleHeader() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isShrunk, setIsShrunk] = useState(false);
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
    <header className={`sticky top-0 z-50 backdrop-blur-sm transition-[padding,background-color,box-shadow] duration-500 ease-out ${
      isShrunk ? 'py-2' : 'py-4 sm:py-6'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className={`flex flex-col transition-[gap] duration-500 ease-in-out ${
            isShrunk ? 'gap-0' : 'gap-1'
          }`}>
            <h1 className={`font-bold transition-[font-size] duration-500 ease-in-out ${
              isShrunk ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'
            }`}>
              <Link
                href="/" 
                className="hover:text-primary transition-colors duration-300 inline-block hover:scale-105 transform"
              >
                {siteConfig.title[language]}
              </Link>
            </h1>
            
            {/* Subtitle with joint collapse effect */}
            <div 
              className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                isShrunk ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
              }`}
            >
              <p className="text-muted-foreground text-xs sm:text-sm">
                {siteConfig.subtitle[language]}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center transition-[gap] duration-500 ease-in-out ${
            isShrunk ? 'gap-1' : 'gap-2'
          }`}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="button-language-toggle"
              className={`transition-[height,width] duration-500 hover:scale-110 hover:bg-accent ${
                isShrunk ? 'h-8 w-8' : 'h-9 w-9'
              }`}
            >
              <Globe className={`transition-[height,width] duration-500 ${
                isShrunk ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className={`transition-[height,width] duration-500 hover:scale-110 hover:bg-accent hover:rotate-180 ${
                isShrunk ? 'h-8 w-8' : 'h-9 w-9'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className={`transition-[height,width] duration-500 ${
                  isShrunk ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
              ) : (
                <Moon className={`transition-[height,width] duration-500 ${
                  isShrunk ? 'h-4 w-4' : 'h-5 w-5'
                }`} />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation with joint accordion effect */}
        <nav 
          className={`overflow-hidden transition-[max-height,opacity,margin-top] duration-500 ease-in-out ${
            isShrunk 
              ? 'max-h-0 opacity-0 mt-0' 
              : 'max-h-20 opacity-100 mt-4'
          }`}>
          <ul className="flex gap-4 sm:gap-6 text-sm sm:text-base">
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
            {siteConfig.external && siteConfig.external.map((link, index) => (
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
        </nav>
      </div>
    </header>
  );
}