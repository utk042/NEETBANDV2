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
    href: 'https://facebook.com',
    icon: IconBrandFacebookFilled,
    hoverColor: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: IconBrandInstagram,
    hoverColor: 'hover:text-[#E4405F] hover:bg-[#E4405F]/10 hover:border-[#E4405F]/30',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: IconBrandYoutubeFilled,
    hoverColor: 'hover:text-[#FF0000] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30',
  },
  {
    name: 'WhatsApp',
    href: 'https://whatsapp.com',
    icon: IconBrandWhatsapp,
    hoverColor: 'hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/30',
  },
];

export default function FollowUsSidebar() {
  return (
    <aside
      aria-label="Follow Us social links"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center transition-all duration-300"
    >
      <div className="flex items-center bg-surface-container-high/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-l border-t border-b border-primary/30 dark:border-primary/25 rounded-l-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] py-3 px-2 gap-2.5">
        {/* Vertical FOLLOW US Label */}
        <div className="flex items-center justify-center pr-1 border-r border-outline/15 dark:border-white/10 select-none">
          <span className="font-headline-md text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant/80 dark:text-on-surface-variant/90 [writing-mode:vertical-rl] rotate-180 py-1">
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
                title={`Follow us on ${item.name}`}
                className={`relative w-8 h-8 rounded-xl bg-surface-container/60 dark:bg-white/5 border border-outline/15 dark:border-white/10 text-on-surface-variant/90 dark:text-white/90 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xs group/icon ${item.hoverColor}`}
              >
                <Icon size={16} className="shrink-0 transition-transform duration-200 group-hover/icon:scale-110" />
                
                {/* Micro Tooltip */}
                <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-surface-container-highest dark:bg-[#1a2442] border border-outline/20 text-on-surface dark:text-white font-label-md text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover/icon:opacity-100 group-hover/icon:pointer-events-auto transition-opacity duration-200 shadow-md">
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
