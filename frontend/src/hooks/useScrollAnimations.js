import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   HOVER HELPERS
   All hover effects use GSAP timelines so they are hardware-accelerated,
   interruptible, and consistent across browsers.
───────────────────────────────────────────────────────────────────────────── */

/**
 * 3-D tilt + glow on mouse-move.
 * Works on any element with [data-gsap="card-hover"].
 */
function attachCardHover(el) {
  const glow = el.querySelector('[data-gsap="card-glow"]');
  if (!glow) return () => {};

  function onMove(e) {
    const rect = el.getBoundingClientRect();
    const gx = ((e.clientX - rect.left) / rect.width)  * 100;
    const gy = ((e.clientY - rect.top)  / rect.height) * 100;
    gsap.to(glow, {
      background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(201,162,39,0.22) 0%, transparent 65%)`,
      duration: 0.15,
      ease: 'none',
    });
  }

  function onEnter() {
    gsap.to(glow, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    el.addEventListener('mousemove', onMove);
  }

  function onLeave() {
    el.removeEventListener('mousemove', onMove);
    gsap.to(glow, { opacity: 0, duration: 0.4, ease: 'power2.out' });
  }

  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);

  return () => {
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mouseleave', onLeave);
    el.removeEventListener('mousemove',  onMove);
  };
}

/**
 * Subtle lift + left-bar slide for list-row items (track rows, FAQ items).
 */
function attachRowHover(el) {
  const bar = el.querySelector('[data-gsap="row-bar"]');
  const tl  = gsap.timeline({ paused: true });
  tl.to(el, { x: 6, duration: 0.25, ease: 'power2.out' });
  if (bar) tl.to(bar, { scaleY: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }, 0);

  const tlOut = gsap.timeline({ paused: true });
  tlOut.to(el, { x: 0, duration: 0.3, ease: 'power3.out' });
  if (bar) tlOut.to(bar, { scaleY: 0, opacity: 0, duration: 0.2, ease: 'power2.out' }, 0);

  el.addEventListener('mouseenter', () => { tlOut.pause(); tl.restart(); });
  el.addEventListener('mouseleave', () => { tl.pause();   tlOut.restart(); });

  return () => {};
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN HOOK
───────────────────────────────────────────────────────────────────────────── */
export default function useScrollAnimations(enabled) {
  useEffect(() => {
    if (!enabled) return;

    const cleanups = [];
    let raf1, raf2;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {

        const ctx = gsap.context(() => {

          /* ── Helpers ─────────────────────────────────────── */
          const fadeUp = (selector, extra = {}) => {
            gsap.utils.toArray(selector).forEach((el) => {
              gsap.fromTo(el,
                { y: 50, autoAlpha: 0 },
                {
                  y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out',
                  immediateRender: false,
                  scrollTrigger: { trigger: el, start: 'top 95%', toggleActions: 'play none none none' },
                  ...extra,
                }
              );
            });
          };

          const slideLeft = (selector, extra = {}) => {
            gsap.utils.toArray(selector).forEach((el) => {
              gsap.fromTo(el,
                { x: -60, autoAlpha: 0 },
                {
                  x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out',
                  immediateRender: false,
                  scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
                  ...extra,
                }
              );
            });
          };

          const slideRight = (selector, extra = {}) => {
            gsap.utils.toArray(selector).forEach((el) => {
              gsap.fromTo(el,
                { x: 60, autoAlpha: 0 },
                {
                  x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out',
                  immediateRender: false,
                  scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
                  ...extra,
                }
              );
            });
          };

          const staggerUp = (parentSel, childSel, extra = {}) => {
            gsap.utils.toArray(parentSel).forEach((section) => {
              const kids = Array.from(section.querySelectorAll(childSel));
              if (!kids.length) return;
              gsap.fromTo(kids,
                { y: 60, autoAlpha: 0, scale: 0.95 },
                {
                  y: 0, autoAlpha: 1, scale: 1,
                  duration: 0.65, ease: 'power3.out', stagger: 0.1,
                  immediateRender: false,
                  scrollTrigger: { trigger: section, start: 'top 92%', toggleActions: 'play none none none' },
                  ...extra,
                }
              );
            });
          };

          /* ── Header slide-down ────────────────────────────── */
          const header = document.querySelector('[data-gsap="header"]');
          if (header) {
            gsap.fromTo(header,
              { y: -80, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', immediateRender: false }
            );
          }

          /* ── Hero text ────────────────────────────────────── */
          const heroEls = document.querySelectorAll('[data-gsap="hero-text"] > *');
          if (heroEls.length) {
            gsap.fromTo(heroEls,
              { y: 40, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.18, delay: 0.1, immediateRender: false }
            );
          }

          /* ── Hero dashboard cards ─────────────────────────── */
          const dashCards = document.querySelectorAll('[data-gsap="dash-card"]');
          if (dashCards.length) {
            gsap.fromTo(dashCards,
              { x: 80, autoAlpha: 0, rotation: 6 },
              { x: 0, autoAlpha: 1, rotation: (i) => ['-3deg', '3deg', '-2deg'][i] || '0deg',
                duration: 0.75, ease: 'back.out(1.5)', stagger: 0.15, delay: 0.45, immediateRender: false }
            );
          }

          /* ── Hero parallax ────────────────────────────────── */
          const heroBg = document.querySelector('[data-gsap="hero-bg"]');
          if (heroBg) {
            gsap.to(heroBg, {
              yPercent: 25, ease: 'none',
              scrollTrigger: { trigger: heroBg, start: 'top top', end: 'bottom top', scrub: 1.5 },
            });
          }

          /* ── Section headings — no animation (static) ───── */

          /* ── Feature cards ────────────────────────────────── */
          staggerUp('[data-gsap="feature-grid"]', '[data-gsap="feature-card"]', { stagger: 0.12 });

          /* ── Pricing cards ────────────────────────────────── */
          staggerUp('[data-gsap="pricing-grid"]', '[data-gsap="pricing-card"]', { stagger: 0.2 });

          /* ── SyllabusLibrary heading left-slide ──────────── */
          slideLeft('[data-gsap="syllabus-heading"]');
          slideRight('[data-gsap="syllabus-filters"]');

          /* ── Track table container ────────────────────────── */
          gsap.utils.toArray('[data-gsap="track-table"]').forEach((el) => {
            gsap.fromTo(el,
              { y: 40, autoAlpha: 0 },
              {
                y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out',
                immediateRender: false,
                scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
              }
            );
          });

          /* ── Track rows stagger ───────────────────────────── */
          staggerUp('[data-gsap="track-list"]', '[data-gsap="track-item"]', { stagger: 0.08 });

          /* ── FAQ heading + items ──────────────────────────── */
          staggerUp('[data-gsap="faq-list"]', '[data-gsap="faq-item"]', { stagger: 0.09 });

          /* ── Footer columns ───────────────────────────────── */
          staggerUp('[data-gsap="footer-grid"]', '[data-gsap="footer-col"]', { stagger: 0.1 });
          fadeUp('[data-gsap="footer-bottom"]');

          /* ── Stat counters (hero dashboard) ──────────────── */
          gsap.utils.toArray('[data-gsap="stat-number"]').forEach((el) => {
            const endStr  = el.textContent.trim();
            const endNum  = parseFloat(endStr.replace(/[^0-9.]/g, ''));
            const suffix  = endStr.replace(/[0-9.]/g, '');
            if (isNaN(endNum)) return;
            gsap.fromTo({ val: 0 }, { val: endNum },
              {
                duration: 1.8, ease: 'power2.out', delay: 0.6,
                onUpdate() { el.textContent = Math.floor(this.targets()[0].val) + suffix; },
              }
            );
          });

          /* ─────────────────────────────────────────────────
             HOVER EFFECTS — attached after scroll setup
          ───────────────────────────────────────────────── */

          // 3-D tilt on feature + pricing cards
          document.querySelectorAll('[data-gsap-hover="card"]').forEach((el) => {
            cleanups.push(attachCardHover(el));
          });

          // Row-lift on track rows
          document.querySelectorAll('[data-gsap="track-item"]').forEach((el) => {
            cleanups.push(attachRowHover(el));
          });

          // Row-lift on FAQ items
          document.querySelectorAll('[data-gsap="faq-item"]').forEach((el) => {
            cleanups.push(attachRowHover(el));
          });

          ScrollTrigger.refresh();
        });

        cleanups.push(() => ctx.revert());
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cleanups.forEach((fn) => typeof fn === 'function' && fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [enabled]);
}
