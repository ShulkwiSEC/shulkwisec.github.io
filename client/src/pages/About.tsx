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

const bgColors = [
  { bgColor: 'bg-blue-500', textColor: 'text-white' },
  { bgColor: 'bg-purple-500', textColor: 'text-white' },
  { bgColor: 'bg-pink-500', textColor: 'text-white' },
  { bgColor: 'bg-green-500', textColor: 'text-white' },
  { bgColor: 'bg-orange-500', textColor: 'text-white' },
  { bgColor: 'bg-red-500', textColor: 'text-white' },
  { bgColor: 'bg-teal-500', textColor: 'text-white' },
  { bgColor: 'bg-indigo-500', textColor: 'text-white' },
  { bgColor: 'bg-yellow-300', textColor: 'text-gray-900' },
  { bgColor: 'bg-lime-300', textColor: 'text-gray-900' },
  { bgColor: 'bg-cyan-300', textColor: 'text-gray-900' },
  { bgColor: 'bg-fuchsia-300', textColor: 'text-gray-900' },
];

const getRandomColor = () => bgColors[Math.floor(Math.random() * bgColors.length)];
export default function About() {
  const { language } = useLanguage();
  const data = aboutConfig;

  const contactChunks = chunkArray(data.contact.links, 3);
  const cardColors = contactChunks.map(() => getRandomColor());

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={data.aboutTitle[language]}
        description={data.aboutText[language]}
        canonicalPath="/about"
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 max-w-3xl py-12">
        <h1 className="text-4xl font-bold mb-8">{data.aboutTitle[language]}</h1>

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
                    className={`flex items-center justify-center ${cardColors[index].bgColor} rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 relative overflow-hidden`}
                    style={{ minWidth: '300px', minHeight: '120px' }}
                  >
                    <div
                      className="absolute inset-0"
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
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-full group-hover:shadow-lg transition-all">
                              <IconComponent className="w-8 h-8" />
                            </div>
                            <span className="bg-black/50 px-1 rounded text-white">
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
