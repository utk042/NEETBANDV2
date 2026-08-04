# Follow Us Floating Sidebar Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a fixed, floating "Follow Us" sidebar tab attached to the right edge of the screen that displays vertical social media links (Facebook, Instagram, YouTube, WhatsApp) matching NeetBand's dark navy & gold theme.

**Architecture:** Create a self-contained `FollowUsSidebar` React component in `frontend/src/components/FollowUsSidebar.jsx` and render it in `frontend/src/routes/UserRoutes.jsx` alongside persistent floating components (`GoToTop`, `StickyPlayer`, etc.).

**Tech Stack:** React, Tailwind CSS, Tabler Icons (`@tabler/icons-react`).

## Global Constraints

- Must match existing NeetBand theme and colors (`border-primary/30`, `bg-surface-container-high/95`, dark navy backdrop).
- Visible on desktop/tablet views (`hidden md:flex`), fixed to right edge (`fixed right-0 top-1/2 -translate-y-1/2 z-40`).
- Hidden on full-screen flows (`/login`, `/checkout`).

---

### Task 1: Create `FollowUsSidebar.jsx` Component

**Files:**
- Create: `frontend/src/components/FollowUsSidebar.jsx`

**Interfaces:**
- Consumes: `@tabler/icons-react` icons (`IconBrandFacebookFilled`, `IconBrandInstagram`, `IconBrandYoutubeFilled`, `IconBrandWhatsapp`).
- Produces: `FollowUsSidebar` React component.

- [ ] **Step 1: Create `FollowUsSidebar.jsx` component**

Write `frontend/src/components/FollowUsSidebar.jsx`:

```jsx
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
```

- [ ] **Step 2: Verify `FollowUsSidebar.jsx` component exists and compiles cleanly**

---

### Task 2: Integrate `FollowUsSidebar` in `UserRoutes.jsx`

**Files:**
- Modify: `frontend/src/routes/UserRoutes.jsx`

**Interfaces:**
- Consumes: `FollowUsSidebar` from `../components/FollowUsSidebar`
- Produces: Persistent floating sidebar on main website pages.

- [ ] **Step 1: Import `FollowUsSidebar` in `UserRoutes.jsx`**

In `frontend/src/routes/UserRoutes.jsx`, add import:
```jsx
import FollowUsSidebar from '../components/FollowUsSidebar';
```

- [ ] **Step 2: Render `<FollowUsSidebar />` conditionally when header is visible**

In `frontend/src/routes/UserRoutes.jsx`, render `<FollowUsSidebar />` near `<GoToTop />` and `<PWAInstallPrompt />`:
```jsx
{!['login', 'checkout'].includes(currentPage) && <FollowUsSidebar />}
```

- [ ] **Step 3: Test frontend build**

Run build or check for build errors in `frontend` directory using `npm run build` or Vite compiler.
