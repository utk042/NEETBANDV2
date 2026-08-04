import React from 'react';
import { 
  IconBrandGoogle, 
  IconBrandSpotify, 
  IconBrandYoutube, 
  IconBrandApple, 
  IconBrandAmazon, 
  IconBrandNetflix, 
  IconBrandDiscord, 
  IconBrandFigma, 
  IconBrandSlack,
  IconBrandLinkedin
} from '@tabler/icons-react';

const PARTNERS = [
  { name: 'Google', logoText: 'Google', icon: IconBrandGoogle, color: '#4285F4' },
  { name: 'Spotify', logoText: 'Spotify', icon: IconBrandSpotify, color: '#1DB954' },
  { name: 'YouTube', logoText: 'YouTube', icon: IconBrandYoutube, color: '#FF0000' },
  { name: 'Apple', logoText: 'Apple', icon: IconBrandApple, color: '#A2AAAD' },
  { name: 'Amazon', logoText: 'Amazon', icon: IconBrandAmazon, color: '#FF9900' },
  { name: 'Netflix', logoText: 'Netflix', icon: IconBrandNetflix, color: '#E50914' },
  { name: 'Discord', logoText: 'Discord', icon: IconBrandDiscord, color: '#5865F2' },
  { name: 'Figma', logoText: 'Figma', icon: IconBrandFigma, color: '#F24E1E' },
  { name: 'Slack', logoText: 'Slack', icon: IconBrandSlack, color: '#E01E5A' },
  { name: 'LinkedIn', logoText: 'LinkedIn', icon: IconBrandLinkedin, color: '#0A66C2' },
];

export default function PartnerScroller() {
  // Duplicate partners array to ensure seamless infinite looping
  const marqueeItems = [...PARTNERS, ...PARTNERS];

  return (
    <section className="py-12 md:py-20 bg-transparent border-t border-outline-variant/15 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center mb-8 md:mb-12">
        <h3 className="font-headline-lg font-serif text-2xl md:text-3xl lg:text-4xl text-on-surface tracking-tight">
          Loved by learners &amp; institutions everywhere
        </h3>
        <p className="text-xs md:text-sm text-on-surface-variant/70 mt-2">
          Trusted by top educators, coaching networks, and individual learners nationwide
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative w-full overflow-hidden flex items-center py-4">
        {/* Left & Right Gradient Fades */}
        <div className="pointer-events-none absolute left-0 top-0 w-16 md:w-32 h-full bg-gradient-to-r from-surface via-surface/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 w-16 md:w-32 h-full bg-gradient-to-l from-surface via-surface/80 to-transparent z-10" />

        <div className="animate-marquee flex items-center gap-12 md:gap-20 whitespace-nowrap">
          {marqueeItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer select-none group"
              >
                <IconComp 
                  size={26} 
                  className="transition-transform duration-300 group-hover:scale-110" 
                  style={{ color: item.color }} 
                />
                <span className="font-extrabold text-base md:text-lg tracking-wider text-on-surface/90 group-hover:text-primary transition-colors font-sans">
                  {item.logoText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
