import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { key: 'home', href: '#home' },
    { key: 'portfolio', href: '#portfolio' },
    { key: 'blog', href: '#blog' },
    { key: 'contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">{t('aboutMe')}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('aboutText')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    data-testid={`link-footer-${link.key}`}
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('newsletter')}</h3>
            <p className="text-muted-foreground text-sm mb-3">
              {t('newsletterText')}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button data-testid="button-subscribe">
                {t('subscribe')}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 {t('rights')}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground ltr:mr-2 rtl:ml-2">{t('followMe')}</span>
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <Button
                key={label}
                size="icon"
                variant="ghost"
                asChild
                data-testid={`link-social-${label.toLowerCase()}`}
              >
                <a href={href} aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
