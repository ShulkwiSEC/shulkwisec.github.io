import { useState } from 'react';
import { Menu, X, Moon, Sun, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { key: 'home', href: '#home' },
    { key: 'portfolio', href: '#portfolio' },
    { key: 'blog', href: '#blog' },
    { key: 'contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">&lt;/&gt;</span>
            </div>
            <span className="font-display font-bold text-xl">{language === 'ar' ? 'محمد' : 'DevPortfolio'}</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.key}
                href={link.href}
                className="text-foreground hover:text-primary transition-colors"
                data-testid={`link-${link.key}`}
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="button-language-toggle"
              className="relative"
            >
              <Globe className="h-5 w-5" />
              <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-1">
                {language.toUpperCase()}
              </span>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map(link => (
              <a
                key={link.key}
                href={link.href}
                className="px-4 py-3 hover-elevate active-elevate-2 rounded-lg text-foreground"
                onClick={() => setIsMenuOpen(false)}
                data-testid={`link-mobile-${link.key}`}
              >
                {t(link.key)}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
