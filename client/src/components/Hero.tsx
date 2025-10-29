import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@assets/generated_images/Hero_background_gradient_mesh_867b8733.png';

export default function Hero() {
  const { t, language } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{language === 'ar' ? 'مطور ويب' : 'Web Developer'}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('heroTitle')}
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="min-w-[200px] group"
            data-testid="button-view-portfolio"
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('viewPortfolio')}
            <ArrowRight className="w-4 h-4 ltr:ml-2 rtl:mr-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="min-w-[200px] backdrop-blur-md bg-background/50"
            data-testid="button-contact"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('getInTouch')}
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: '50+', label: language === 'ar' ? 'مشروع' : 'Projects' },
            { value: '30+', label: language === 'ar' ? 'عميل' : 'Clients' },
            { value: '5+', label: language === 'ar' ? 'سنوات خبرة' : 'Years' },
            { value: '15+', label: language === 'ar' ? 'تقنية' : 'Technologies' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
