import { Code, Smartphone, Cloud, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const services = [
  {
    icon: Code,
    titleKey: 'webDev',
    descKey: 'webDevDesc',
  },
  {
    icon: Smartphone,
    titleKey: 'mobileDev',
    descKey: 'mobileDevDesc',
  },
  {
    icon: Cloud,
    titleKey: 'cloudSolutions',
    descKey: 'cloudSolutionsDesc',
  },
  {
    icon: Lightbulb,
    titleKey: 'consulting',
    descKey: 'consultingDesc',
  },
];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            {t('servicesTitle')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Card
                key={idx}
                className="p-8 hover-elevate transition-all duration-300 cursor-pointer"
                data-testid={`card-service-${idx}`}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t(service.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(service.descKey)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
