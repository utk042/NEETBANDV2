# SEO, GEO & AEO Production Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform NeetBand into a fully SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) production-ready platform on domain `https://neetband.com`.

**Architecture:** Create a native React `useSeoHead` hook that dynamically manages title tags, meta descriptions, canonical URLs, OpenGraph/Twitter cards, and JSON-LD schemas per route navigation. Add production static assets (`robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`) in `frontend/public/`. Update HTML structure for high accessibility and crawler readability.

**Tech Stack:** React 18, Vite, React Router v7, JSON-LD (Schema.org), Tailwind CSS.

## Global Constraints
- Primary Domain: `https://neetband.com`
- Platform Name: `NeetBand`
- Focus: Auditory learning for NEET aspirants (Class 11 & 12 Biology, Chemistry, Physics)
- Protected Private Routes (marked `noindex, nofollow`): `/dashboard`, `/checkout`, `/lms/*`, `/feed`, `/offers/*`

---

### Task 1: Create `useSeoHead` Hook & Integrate in Routes

**Files:**
- Create: `frontend/src/hooks/useSeoHead.js`
- Modify: `frontend/src/routes/UserRoutes.jsx`
- Modify: `frontend/index.html`

**Interfaces:**
- Consumes: Route location from React Router `useLocation()`.
- Produces: Dynamic DOM updates to `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:*">`, `<meta name="twitter:*">`, and `<script id="json-ld-schema" type="application/ld+json">`.

- [ ] **Step 1: Write `useSeoHead` hook**

Create `frontend/src/hooks/useSeoHead.js` with dynamic update logic for titles, meta descriptions, canonical links, OpenGraph tags, Twitter cards, robots tags, and JSON-LD structured data script element management.

- [ ] **Step 2: Update `index.html` base domain and meta defaults**

Replace temporary domain references in `frontend/index.html` with `https://neetband.com` and structured metadata.

- [ ] **Step 3: Connect `useSeoHead` inside `UserRoutes.jsx`**

Invoke `useSeoHead()` inside `UserRoutes` component so every page transition automatically updates search and social metadata based on current URL path.

---

### Task 2: Create GEO Static Files (`llms.txt` & `llms-full.txt`)

**Files:**
- Create: `frontend/public/llms.txt`
- Create: `frontend/public/llms-full.txt`

**Interfaces:**
- Consumes: Platform knowledge base from `PRODUCT.md` and course data.
- Produces: LLM-parseable markdown documents at `https://neetband.com/llms.txt` and `https://neetband.com/llms-full.txt`.

- [ ] **Step 1: Create `llms.txt`**

Write standard markdown AI context file outlining NeetBand mission, song-based study methodology, target NEET subjects (Biology, Chemistry, Physics), key links, and core capabilities.

- [ ] **Step 2: Create `llms-full.txt`**

Write extended markdown AI context file containing detailed syllabus breakdown, audio mnemonic learning benefits (eye health, high memory retention), and complete FAQ database for AI retrieval engines.

---

### Task 3: Create SEO Static Files (`robots.txt` & `sitemap.xml`)

**Files:**
- Create: `frontend/public/robots.txt`
- Create: `frontend/public/sitemap.xml`

**Interfaces:**
- Consumes: Public site URL list.
- Produces: Search crawler rule set and XML sitemap at `https://neetband.com/robots.txt` and `https://neetband.com/sitemap.xml`.

- [ ] **Step 1: Create `robots.txt`**

Write production `robots.txt` allowing indexing for `/`, `/course`, `/library`, `/about`, `/contact`, `/terms`, `/privacy`, `/refund`, `/blog`, `/favourites`, `/hub` and blocking `/dashboard`, `/checkout`, `/lms/`, `/feed`, `/offers/`, `/auth/`. Point to sitemap at `https://neetband.com/sitemap.xml`.

- [ ] **Step 2: Create `sitemap.xml`**

Write valid W3C standard `sitemap.xml` listing all indexable public URLs with priorities, change frequencies, and ISO timestamps.

---

### Task 4: Verify Build & Test Static Asset Server

**Files:**
- Modify: None (Verification step)

- [ ] **Step 1: Run Vite production build**

Execute `npm run build` in `frontend` directory to ensure all new public static files are bundled into `dist/` cleanly without lint or syntax errors.

- [ ] **Step 2: Verify `dist/` asset structure**

Confirm presence of `dist/robots.txt`, `dist/sitemap.xml`, `dist/llms.txt`, and `dist/llms-full.txt`.
