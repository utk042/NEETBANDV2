# Design Spec: Floating "Follow Us" Sidebar Tab

## Overview
Implement a fixed floating "Follow Us" sidebar tab attached to the right edge of the screen, matching the user's reference screenshot and NeetBand's dark navy & gold design system.

## Key Features & Requirements

1. **Component**: `FollowUsSidebar.jsx` located in `frontend/src/components/FollowUsSidebar.jsx`.
2. **Placement & Z-Index**:
   - Fixed to the right edge of the screen (`fixed right-0 top-1/2 -translate-y-1/2`).
   - Positioned with `z-40` or `z-fab` (below modals and dropdowns, above regular page content).
   - Displayed on tablet & desktop (`hidden md:flex`) so it doesn't obstruct touch controls or sticky player on mobile devices.
3. **Aesthetics & Theme Alignment**:
   - Background: Dark glassmorphic container (`bg-[#0c152e]/90` dark mode / `bg-surface-container-high/95` light mode backdrop-blur-md).
   - Border: Subtle left, top, bottom gold/outline border (`border-l border-t border-b border-primary/25 rounded-l-2xl shadow-2xl`).
   - Left Label: Vertical uppercase text `"FOLLOW US"` with tracking (`tracking-[0.2em] font-extrabold text-[11px] text-on-surface-variant/80 select-none`), oriented vertically (`writing-mode: vertical-rl` / rotated 180deg).
   - Icons:
     - Facebook (`IconBrandFacebookFilled`) -> `https://facebook.com`
     - Instagram (`IconBrandInstagram`) -> `https://instagram.com`
     - YouTube (`IconBrandYoutubeFilled`) -> `https://youtube.com`
     - WhatsApp (`IconBrandWhatsapp`) -> `https://whatsapp.com`
   - Micro-interactions:
     - Smooth hover scaling (`hover:scale-110 hover:text-primary`).
     - Tooltips on hover showing the target platform name (e.g. "Follow us on Instagram").
4. **Integration**:
   - Included in `UserRoutes.jsx` alongside persistent controls (`GoToTop`, `StickyPlayer`, etc.).
   - Automatically hidden on full-screen checkout or login routes if header/navigation is hidden.

## Data & Configuration
- External social links configured as clean constants with `aria-label`, `target="_blank"`, `rel="noopener noreferrer"`.

## Verification
- Visual inspection across pages (`/`, `/pricing`, `/library`, etc.).
- Check hover effects, responsive visibility on window resize, link clicks opening in new tab.
