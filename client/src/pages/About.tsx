import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/layout/SEO';
import { useLanguage } from '@/contexts/Language';
import * as Icons from 'lucide-react';
import { aboutConfig } from '@/lib/data';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const getIconComponent = (iconName: string): React.ElementType => {
  return (Icons as any)[iconName] || Icons.ExternalLink;
};

const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

// Two on-palette tones, alternated deterministically by card index — the
// card itself just needs to hold the rug pattern + icons, not compete for
// attention with a different random hue every render.
const cardTones = [
  { bgColor: 'bg-card', borderColor: 'border-border' },
  { bgColor: 'bg-accent', borderColor: 'border-accent-foreground/10' },
];

export default function About() {
  const { language } = useLanguage();
  const data = aboutConfig;

  const contactChunks = chunkArray(data.contact.links, 3);
  const cardColors = contactChunks.map((_, index) => cardTones[index % cardTones.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={data.aboutTitle[language]}
        description={data.aboutText[language]}
        canonicalPath="/about"
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <h1 className="font-display text-4xl font-bold mb-8">{data.aboutTitle[language]}</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed mb-6">{data.aboutText[language]}</p>
          <p className="leading-relaxed mb-6">{data.bio[language]}</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">{data.skills.title[language]}</h2>
          <ul className="space-y-2 mb-6">
            {data.skills.items.map((skill: any, i: number) => (
              <li key={i}>
                <strong>{skill.name}:</strong>{' '}
                {typeof skill.value === 'string' ? skill.value : skill.value[language]}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">{data.contact.title[language]}</h2>
          <div className="w-full flex justify-center items-center mt-6">
            <Swiper
              effect="cards"
              grabCursor
              modules={[EffectCards, Autoplay]}
              className="w-auto"
              style={{ height: '150px' }}
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              loop={contactChunks.length > 2}
              direction="vertical"
              speed={800}
              cardsEffect={{
                perSlideOffset: 8,
                perSlideRotate: 2,
                slideShadows: true,
              }}
            >
              {contactChunks.map((linkChunk, index) => (
                <SwiperSlide key={index} style={{ width: 'auto', height: 'auto' }}>
                  <div
                    className={`flex items-center justify-center ${cardColors[index].bgColor} rounded-2xl shadow-xl border ${cardColors[index].borderColor} p-6 relative overflow-hidden`}
                    style={{ minWidth: '300px', minHeight: '120px' }}
                  >
                    <div
                      className="absolute inset-0 opacity-40 dark:opacity-20"
                      style={{
                        backgroundImage: 'url("/rug.svg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />

                    <div className="flex items-center justify-center gap-6 z-10 relative">
                      {linkChunk.map((link: any, i: number) => {
                        const IconComponent = getIconComponent(link.icon);
                        return (
                          <a
                            key={i}
                            href={link.url}
                            className="flex flex-col items-center gap-2 text-center hover:scale-110 transition-transform group"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="bg-background p-4 rounded-full text-primary group-hover:shadow-lg group-hover:text-primary transition-all">
                              <IconComponent className="w-8 h-8" />
                            </div>
                            <span className="bg-background/90 border border-border px-2 py-0.5 rounded-md text-foreground">
                              <span className="text-base font-semibold">{link.name}</span>
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
