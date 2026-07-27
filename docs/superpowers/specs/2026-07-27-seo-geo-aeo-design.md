# Design Document: NeetBand SEO, GEO & AEO Production Optimization

**Date**: 2026-07-27  
**Status**: Approved  
**Domain**: https://neetband.com  

---

## Executive Summary
This design document specifies the architectural enhancements required to make NeetBand (auditory learning platform for NEET aspirants) fully production-ready across Search Engine Optimization (SEO), Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO).

---

## 1. Architecture & Meta Management

### 1.1 Custom Hook: `useSeoHead`
A lightweight React hook located at `frontend/src/hooks/useSeoHead.js` will manage all head metadata dynamically per route without external library dependencies:
- **Title**: Dynamic document title updating with brand suffix `| NeetBand`.
- **Meta Description**: Specific summary tailored to the active view.
- **Canonical Link**: Standardized canonical tag `<link rel="canonical" href="https://neetband.com<pathname>" />`.
- **OpenGraph & Twitter Cards**: Dynamic `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- **Robots Directives**: `index, follow` for public pages; `noindex, nofollow` for protected pages (`/dashboard`, `/checkout`, `/lms/*`, `/feed`, `/offers/*`).
- **JSON-LD Script Injection**: Automated injection and clean-up of `<script type="application/ld+json">` elements on mount/unmount/update.

### 1.2 Base `index.html` Updates
- Standardize primary fallback meta tags to use `https://neetband.com`.
- Ensure proper viewport, theme colors, manifest links, and favicons.

---

## 2. SEO Static Assets

### 2.1 `frontend/public/robots.txt`
```txt
User-agent: *
Allow: /
Allow: /course
Allow: /about
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /refund
Allow: /blog
Allow: /hub
Allow: /library
Allow: /favourites

Disallow: /dashboard
Disallow: /checkout
Disallow: /lms/
Disallow: /feed
Disallow: /offers/
Disallow: /auth/

Sitemap: https://neetband.com/sitemap.xml
```

### 2.2 `frontend/public/sitemap.xml`
Valid XML 1.0 sitemap including all public routes:
- `https://neetband.com/` (priority 1.0)
- `https://neetband.com/course` (priority 0.9)
- `https://neetband.com/library` (priority 0.8)
- `https://neetband.com/about` (priority 0.7)
- `https://neetband.com/blog` (priority 0.7)
- `https://neetband.com/contact` (priority 0.6)
- `https://neetband.com/terms` (priority 0.4)
- `https://neetband.com/privacy` (priority 0.4)
- `https://neetband.com/refund` (priority 0.4)

---

## 3. GEO Strategy (Generative Engine Optimization)

### 3.1 `frontend/public/llms.txt`
Standard markdown file optimized for LLM search agents (Perplexity, ChatGPT Search, Claude, Gemini):
- Brand identity & purpose (auditory learning for NEET Biology, Chemistry, Physics).
- Core features & song mnemonic methodology.
- Target audience (Class 11 & 12 NEET aspirants).
- Canonical URL references to main site sections.

### 3.2 `frontend/public/llms-full.txt`
Extended knowledge context file detailing:
- Detailed syllabus breakdown (NCERT-aligned NEET Biology, Chemistry, Physics audio tracks).
- Comprehensive FAQ list.
- Eye-health mission (reducing screen time through high-retention audio tracks).

---

## 4. AEO & JSON-LD Schemas

### 4.1 Home Page Schemas (`/`)
1. **`EducationalOrganization`**: Name, URL (`https://neetband.com`), logo, description, target audience.
2. **`WebSite`**: Includes `potentialAction` (`SearchAction`) for internal search query parsing.
3. **`FAQPage`**: JSON-LD representation of top FAQs for instant Google/AI answers.
4. **`SpeakableSpecification`**: Highlighting auditory content sections.

### 4.2 Course & Library Schemas (`/course`)
1. **`Course`**: Multi-course schema representing NEET Biology, Chemistry, and Physics auditory learning modules.
2. **`BreadcrumbList`**: Structured breadcrumb navigation hierarchy.

---

## 5. Verification & Testing Plan
- Validate `sitemap.xml` format and URL accessibility.
- Validate `robots.txt` syntax and crawler permissions.
- Validate JSON-LD structured data using Google Rich Results Test & schema syntax validator.
- Verify `llms.txt` and `llms-full.txt` accessibility at `https://neetband.com/llms.txt`.
- Verify dynamic title, meta, canonical, and OG tag rendering across user routes.
