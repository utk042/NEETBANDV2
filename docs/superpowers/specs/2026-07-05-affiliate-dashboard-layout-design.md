# Affiliate Dashboard Layout Redesign

Align the layout of the Affiliate Dashboard to match the LMS portal's sidebar layout, theme controls, mobile responsiveness, and page styling.

## Proposed Design

### 1. Theme and Navigation State
- **Theme State:** Managed in `AffiliateRoutes.jsx` and persisted in `localStorage` (`theme` key). Synchronized with `document.documentElement` class list (`dark` vs `light`). Passed to `AffiliateDashboard.jsx`.
- **Tab State:** Managed in `AffiliateDashboard.jsx`, initial value fetched from URL query parameter `tab`, default is `'dashboard'`. Tab switches update the URL query using `window.history.pushState`.

### 2. Layout Structure
- **Sidebar (Left):**
  - Brand header displaying "Affiliate Partner".
  - User details block containing User Name and Role ("Affiliate Partner").
  - Navigation menu with links:
    - Dashboard (`IconLayoutDashboard`)
    - Referrals (`IconUsers`)
    - Settlements (`IconReceipt`)
  - Logout action button at the bottom of the sidebar.
  - Mobile responsiveness: Slide-in/out drawer controlled by state variable `isSidebarOpen` and a backdrop overlay.
- **Header (Top):**
  - Height of 72px, matches LMS header style.
  - Hamburger menu icon visible only on mobile to open the sidebar.
  - Sun/Moon theme toggle button to switch between light and dark themes.
- **Main Container:**
  - Content area dynamically renders components based on the selected tab (`activeTab`).

### 3. Content Views
- **Dashboard View:**
  - Welcome card banner.
  - Promo code card display.
  - Summary stats cards (Total Earnings and Total Referrals) styled using LMS dashboard aesthetics.
- **Referrals View:**
  - Full-width referral records table in a premium card component.
- **Settlement History View:**
  - Full-width settlement history table/list in a premium card component.
