import React from 'react';
import { IconHome, IconPlaylist, IconLayoutDashboard, IconBook2, IconUsers } from '@tabler/icons-react';

export default function MobileNavbar({ currentPage, navigate, user = { isLoggedIn: false } }) {
  const items = [
    { id: 'home',      label: 'Home',      icon: IconHome },
    { id: 'library',   label: 'Library',   icon: IconPlaylist },
    { id: 'course',    label: 'Course',    icon: IconBook2 },
    { id: 'feed',      label: 'Feed',      icon: IconUsers },
    { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-nav-mobile flex justify-around items-center px-1 h-20 bg-surface-container/90 dark:bg-[#121927] backdrop-blur-xl border-t border-outline/10 dark:border-[#1f2838] md:hidden transition-all duration-300 fixed-bottom-safe shadow-[var(--shadow-nav-layout)]">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = currentPage === id;
        return (
          <button
            key={id}
            onClick={() => {
              if ((id === 'dashboard' || id === 'feed' || id === 'course') && !user.isLoggedIn) {
                // If they want to access protected sections but aren't logged in, redirect to login
                // But for now, allow routing to let App handle it, or just route to login.
                // Assuming App handles dashboard rendering, but actually App hides dashboard if not logged in.
                // For simplicity, we just set the page.
              }
              navigate(id === 'home' ? '/' : `/${id}`);
            }}
            className={`flex flex-col items-center justify-center gap-1 w-[20%] py-2 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-[#fbd64f]/50 ${
              isActive ? 'text-primary dark:text-[#fbd64f]' : 'text-on-surface-variant dark:text-[#a0a8b9] hover:text-primary dark:hover:text-[#fbd64f]'
            }`}
          >
            <Icon size={24} stroke={isActive ? 2 : 1.5} className="block" aria-hidden="true" />
            <span className={`font-semibold text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
