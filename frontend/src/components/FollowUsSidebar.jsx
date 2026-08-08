import React from 'react';
import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandYoutubeFilled,
  IconBrandWhatsapp
} from '@tabler/icons-react';

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/NEETBandStudy/',
    icon: IconBrandFacebookFilled,
    hoverColor: 'hover:text-[#1877F2] hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 hover:shadow-[0_0_15px_rgba(24,119,242,0.35)]',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/neetbandstudy',
    icon: IconBrandInstagram,
    hoverColor: 'hover:text-[#E4405F] hover:bg-[#E4405F]/15 hover:border-[#E4405F]/40 hover:shadow-[0_0_15px_rgba(228,64,95,0.35)]',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@neetbandstudy',
    icon: IconBrandYoutubeFilled,
    hoverColor: 'hover:text-[#FF0000] hover:bg-[#FF0000]/15 hover:border-[#FF0000]/40 hover:shadow-[0_0_15px_rgba(255,0,0,0.35)]',
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/919477411701',
    icon: IconBrandWhatsapp,
    hoverColor: 'hover:text-[#25D366] hover:bg-[#25D366]/15 hover:border-[#25D366]/40 hover:shadow-[0_0_15px_rgba(37,211,102,0.35)]',
  },
];

export default function FollowUsSidebar() {
  return (
    <aside
      aria-label="Follow Us social links"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center transition-all duration-300 select-none"
    >
      <div className="flex items-center bg-[#f0f6ff]/95 dark:bg-[#07132b]/95 backdrop-blur-md border-l border-t border-b border-blue-500/40 dark:border-blue-400/30 rounded-l-2xl shadow-[0_10px_30px_rgba(2,44,122,0.25)] dark:shadow-[0_10px_30px_rgba(37,99,235,0.2)] py-3 px-2 gap-2.5">
        {/* Vertical FOLLOW US Label */}
        <div className="flex items-center justify-center pr-1 border-r border-blue-500/20 dark:border-blue-400/20 select-none">
          <span className="font-headline-md text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 [writing-mode:vertical-rl] rotate-180 py-1 drop-shadow-xs">
            FOLLOW US
          </span>
        </div>

        {/* Social Icons Stack */}
        <div className="flex flex-col items-center gap-2">
          {SOCIAL_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${item.name}`}
                className={`relative w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 text-blue-900 dark:text-blue-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs group/icon ${item.hoverColor}`}
              >
                <Icon size={16} className="shrink-0 pointer-events-none transition-transform duration-200 group-hover/icon:scale-110" />
                
                {/* Micro Tooltip */}
                <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#0c224a] dark:bg-[#091b3e] border border-blue-400/30 text-blue-100 font-label-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover/icon:opacity-100 transition-all duration-200 shadow-lg shadow-blue-950/50">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
