# Uniform Blog Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the blog posts list view on NEET Band into a clean, uniform grid layout where all cards share identical sizing and layout.

**Architecture:** Remove `isFeatured` flag and logic from `Blog.jsx`. Restructure the article rendering mapping so every blog card is formatted identically as a 1-column card within a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` container, utilizing CSS line-clamping and flex layouts for consistent heights.

**Tech Stack:** React, Tailwind CSS

## Global Constraints
- Keep lines short and bullet points concise.
- Use file basenames for links, avoiding surrounding link text in backticks.
- No placeholders (TODO, TBD).

---

### Task 1: Convert Blog Cards to Uniform Grid Layout

**Files:**
- Modify: [Blog.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Blog.jsx)

**Interfaces:**
- Consumes: `blogs` list from state fetched from `/blogs` endpoint.
- Produces: Uniform grid items on `/blog` route.

- [ ] **Step 1: Check existing build passes**

Run: `npm run build` inside `c:\Users\UTKARSH\Downloads\NEETBANBV2\frontend`
Expected: Successful compile and build.

- [ ] **Step 2: Update Blog.jsx render logic**

Replace lines 274 to 336 in [Blog.jsx](file:///c:/Users/UTKARSH/Downloads/NEETBANBV2/frontend/src/components/Blog.jsx) with uniform grid rendering:

```jsx
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((article) => (
                <article 
                  key={article._id} 
                  className="col-span-1 bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] overflow-hidden hover:border-primary/30 transition-all duration-300 group flex flex-col cursor-pointer"
                  onClick={() => navigate(`/blog/${article.slug || article._id}`)}
                >
                  <div className="w-full aspect-[16/10] relative overflow-hidden border-b border-[var(--border-floating-card)] bg-black/20">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                    )}
                    {article.tags?.[0] && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md text-on-surface text-[10px] font-bold uppercase tracking-wider border border-[var(--border-floating-card)]">
                          {article.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3 text-on-surface-variant/70 text-xs font-body-md">
                        <span className="flex items-center gap-1.5"><IconCalendarEvent size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><IconUser size={14} /> {article.author?.name || 'Unknown'}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed line-clamp-3">
                        {article.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 font-label-md text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        Read Article <IconArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
```

- [ ] **Step 3: Run frontend build to verify no errors**

Run: `npm run build` inside `c:\Users\UTKARSH\Downloads\NEETBANBV2\frontend`
Expected: Successful compile and build.

- [ ] **Step 4: Commit changes**

Run:
```powershell
git add frontend/src/components/Blog.jsx
git commit -m "feat: convert blogs to uniform grid layout"
```
