# Design Specification: Uniform Blog Grid Layout

Convert the blog posts list view on NEET Band into a clean, uniform grid layout where all blog cards share the same dimensions and styling structure. This replaces the horizontal "featured post" card at the top.

## Goals
- Align with NEET Band's "Focus Sanctuary" design star by presenting a clean, consistent, and balanced visual structure.
- Remove the horizontal layout stretch of the first blog post to maintain a uniform grid.
- Keep the design responsive: 1 column on mobile, 2 columns on tablet/medium screens, and 3 columns on desktop.

## Proposed Changes

### Frontend Component

#### [MODIFY] [Blog.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Blog.jsx)
- Remove `isFeatured` variable/logic completely.
- Update the class definition of the `<article>` tag to be uniform:
  - Container classes: `col-span-1 bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] overflow-hidden hover:border-primary/30 transition-all duration-300 group flex flex-col cursor-pointer`
  - Remove all ternary styling checks based on `isFeatured`.
- Standardize the image wrapper:
  - Set container to `w-full aspect-[16/10] relative overflow-hidden border-b border-[var(--border-floating-card)] bg-black/20`.
  - Ensure the image has `w-full h-full object-cover`.
- Standardize content padding and typography:
  - Content container classes: `p-6 md:p-8 flex-1 flex flex-col justify-between`
  - Title element: `text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2` (ensure line clamping to prevent layout shifts).
  - Summary element: `text-sm text-on-surface-variant/80 mb-6 line-clamp-3`.

## Verification Plan

### Automated Checks
- Verify Vite project builds successfully: `npm run build` inside `frontend/`.

### Manual Verification
- Access `/blog` in the browser.
- Verify all cards align in a perfect grid layout.
- Verify responsiveness across viewport widths (3 columns on desktop, 2 on tablet, 1 on mobile).
