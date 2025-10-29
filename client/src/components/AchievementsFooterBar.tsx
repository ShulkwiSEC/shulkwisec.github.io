import { useLanguage } from '@/contexts/LanguageContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ExternalLink } from 'lucide-react';
import 'swiper/css';
import templateData from '@/data/template.json';
import { useState } from 'react';

interface Achievement {
  title: {
    ar: string;
    en: string;
  };
  subtitle: {
    ar: string;
    en: string;
  };
  banner?: string;
  fallback: string;
}

const getRandomColor = (index: number) => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-teal-500 to-teal-600',
  ];
  return colors[index % colors.length];
};

export default function AchievementsFooterBar() {
  const { language } = useLanguage();
  const achievements = templateData.achievements as Achievement[];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/10 border-t py-1">
      <div className="container mx-auto px-5 max-w-3xl">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={2}
            slidesPerView={5}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="achievements-footer-slider mx-auto"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {achievements.map((achievement, index) => (
              <SwiperSlide 
                key={index} 
                onMouseEnter={() => setHoveredIndex(index)}
                className="transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <div className="relative">
                  <a
                    href={achievement.fallback}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/50 transition-colors">
                      {/* Small thumbnail */}
                      <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                        {achievement.banner ? (
                          <img
                            src={achievement.banner}
                            alt={achievement.title[language]}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getRandomColor(index)} flex items-center justify-center`}>
                            <svg
                              className="w-4 h-4 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2L2 7L12 12L22 7L12 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 17L12 22L22 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                            {achievement.title[language]}
                          </h4>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {achievement.subtitle[language]}
                        </p>
                      </div>
                    </div>
                  </a>
                  {hoveredIndex === index && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-popover text-popover-foreground p-2 rounded-md shadow-lg z-10">
                      <p className='text-sm font-bold'>{achievement.title[language]}</p>
                      <p className='text-xs'>{achievement.subtitle[language]}</p>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
      </div>
    </div>
  );
}