import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Partner() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Partner With NEET BAND
          </h1>
          <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
            We believe that collaboration is at the heart of better education. NEET BAND is open to partnerships with educational institutions, coaching centres, content creators, EdTech companies, and organisations that share our mission of making learning more effective and accessible.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant/70 mt-2 font-medium">
            Whether you are a school, a startup, a creator, or an enterprise, if your work connects with students and their academic success, there may be an opportunity to build something meaningful together.
          </p>
        </header>

        <div className="prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          {/* Section 1 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. About NEET BAND</h2>
            <p className="mb-3">
              NEET BAND is an audio-based educational platform that converts complex academic topics into simple, memorable study songs. We are a DPIIT-recognised startup focused on helping students preparing for NEET, JEE, board exams, and other competitive examinations.
            </p>
            <p>
              We are building the largest audio learning library for Indian competitive exam students and are actively looking for partners who can help us reach more students, enrich our content, and improve our platform.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Types of Partnerships</h2>
            <p className="mb-3">We are open to a wide range of partnership models depending on your organisation's goals and capabilities:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li><strong className="text-on-surface">Institutional Partnerships</strong> — Schools, colleges, and coaching centres that wish to integrate NEET BAND into their study resources or offer it to their students</li>
              <li><strong className="text-on-surface">Content Collaborations</strong> — Subject experts, educators, and academic institutions interested in co-creating or licensing educational audio content</li>
              <li><strong className="text-on-surface">EdTech Integrations</strong> — Technology or learning platforms looking to integrate or cross-promote complementary products</li>
              <li><strong className="text-on-surface">Distribution Partnerships</strong> — Organisations that help distribute NEET BAND's services to their student or parent audience</li>
              <li><strong className="text-on-surface">NGO and CSR Partnerships</strong> — Non-profits, foundations, and CSR programmes focused on educational access and student welfare</li>
              <li><strong className="text-on-surface">Affiliate and Referral Partners</strong> — Creators, educators, and influencers who promote NEET BAND to their audiences and earn commissions on referrals</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. What We Offer Partners</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Co-branding and joint promotion opportunities across our platform and channels</li>
              <li>Access to a growing audience of motivated students and their families</li>
              <li>Custom subscription arrangements and group access for institutions</li>
              <li>Shared content development and licensing options where relevant</li>
              <li>Transparent partnership agreements with clear terms and mutual accountability</li>
              <li>Dedicated point of contact to manage the relationship and resolve queries</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. What We Look For in Partners</h2>
            <p className="mb-3">We approach each partnership with care to ensure it is genuinely valuable for students. We look for partners who:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Have a genuine focus on student learning, wellbeing, or academic success</li>
              <li>Operate with transparency, honesty, and ethical practices</li>
              <li>Have a complementary audience or service that aligns with NEET BAND's mission</li>
              <li>Are willing to work collaboratively and communicate clearly</li>
              <li>Respect student privacy and comply with applicable laws and regulations</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Affiliate Programme</h2>
            <p className="mb-3">
              Our affiliate programme allows teachers, content creators, educational influencers, and student community managers to earn commissions by referring students to NEET BAND's premium subscriptions.
            </p>
            <p className="mb-3">
              Affiliates receive a unique referral link, access to promotional materials, and real-time tracking of their referrals and earnings. Payouts are made on a regular basis.
            </p>
            <p>
              If you have an audience of students or parents and want to earn while helping them discover a better way to study, our affiliate programme may be right for you.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Institutional Access</h2>
            <p className="mb-3">
              We offer schools, coaching centres, and educational institutions the ability to provide their students with group or bulk access to NEET BAND's premium content at discounted rates.
            </p>
            <p>
              If you represent an institution and are interested in integrating NEET BAND into your study programme or student offering, please reach out to discuss available options, pricing, and implementation.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Partnership Terms</h2>
            <p className="mb-3">
              All partnerships are governed by a formal partnership agreement that outlines the scope, responsibilities, revenue share (if applicable), exclusivity provisions, duration, and termination conditions.
            </p>
            <p>
              We do not enter into informal or verbal-only arrangements. Clear documentation protects both parties and ensures the partnership can be built on a solid foundation.
            </p>
          </div>

          {/* Contact section */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Start a Conversation</h2>
            <p className="mb-4">
              If you are interested in partnering with NEET BAND, we would love to hear from you. Please reach out through our Contact page with a brief overview of your organisation, the type of partnership you have in mind, and how you believe we can create value together. We aim to respond within 3 business days.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Go to Contact Page →
            </button>
            <p className="mt-6 text-sm text-on-surface-variant/70">
              <strong className="text-on-surface">NEET BAND</strong>
              <br />Address: Dr Biresh Guha Street, Kolkata-700017
              <br />Email: <a href="mailto:Contact@neetband.com" className="text-primary hover:underline">Contact@neetband.com</a>
              <br />Website: <a href="https://neetband.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://neetband.com/</a>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
