import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Careers() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Careers at NEET BAND
          </h1>
          <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
            Join a mission-driven team that is changing the way students learn. At NEET BAND, we believe education should be engaging, accessible, and effective — and we are looking for passionate people who share that belief.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant/70 mt-2 font-medium">
            We are a growing EdTech startup recognised under DPIIT's Startup India programme. If you are excited about audio learning, curriculum design, technology, or student success, we would love to hear from you.
          </p>
        </header>

        <div className="prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          {/* Section 1 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. Who We Are</h2>
            <p className="mb-3">
              NEET BAND is an audio-based educational platform that converts complex academic concepts into memorable study songs. We help students preparing for NEET, JEE, board exams, and other competitive exams to revise and recall key concepts more effectively.
            </p>
            <p>
              Our team is small but ambitious. We work across content creation, technology, product design, marketing, and student experience — all with a shared goal of making studying less stressful and more effective.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Why Work With Us</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Be part of an early-stage startup with real impact on student outcomes</li>
              <li>Work on meaningful problems in education, audio, and technology</li>
              <li>Collaborative, learning-first culture with a flat hierarchy</li>
              <li>Flexible and remote-friendly work environment</li>
              <li>Opportunity to grow with the company as we scale</li>
              <li>DPIIT-recognised Startup India entity with a clear product roadmap</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Areas We Hire For</h2>
            <p className="mb-3">We hire across different functions depending on our growth stage. Current and upcoming areas include:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li><strong className="text-on-surface">Content &amp; Curriculum</strong> — Subject matter experts, lyricists, academic writers, voice artists</li>
              <li><strong className="text-on-surface">Technology</strong> — Frontend developers (React), backend engineers (Node.js), mobile developers</li>
              <li><strong className="text-on-surface">Design</strong> — UI/UX designers, motion designers, visual artists</li>
              <li><strong className="text-on-surface">Growth &amp; Marketing</strong> — Social media, SEO, paid ads, student community managers</li>
              <li><strong className="text-on-surface">Operations</strong> — Customer support, onboarding, partnerships coordination</li>
            </ul>
            <p className="mt-3">
              We also welcome applications from interns, freelancers, and contributors who want to work with us in a flexible capacity.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Open Positions</h2>
            <p className="mb-3">
              We do not always have published job listings, but we are always open to hearing from talented individuals who align with our mission.
            </p>
            <p>
              If you believe you have skills, experience, or ideas that can contribute to NEET BAND's growth, we encourage you to reach out directly. Tell us who you are, what you do, and why you want to be part of our journey.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Our Hiring Process</h2>
            <p className="mb-3">Our typical hiring process is straightforward and designed to be respectful of your time:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Introduction call or written conversation to understand your background and interests</li>
              <li>A short task or portfolio review relevant to the role (where applicable)</li>
              <li>A final discussion with the team to align on expectations, culture, and next steps</li>
            </ul>
            <p className="mt-3">
              We aim to communicate clearly and promptly at each stage. We respect your time and effort.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Values We Look For</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Genuine interest in education and student success</li>
              <li>Ownership mindset — you take responsibility for your work</li>
              <li>Clear communicator who gives and receives feedback well</li>
              <li>Curiosity, adaptability, and willingness to learn</li>
              <li>Ability to work independently in a remote or semi-remote setup</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Equal Opportunity</h2>
            <p>
              NEET BAND is an equal opportunity employer. We do not discriminate on the basis of gender, religion, caste, nationality, disability, age, or any other protected characteristic. We are committed to building a diverse and inclusive team where everyone can contribute and grow.
            </p>
          </div>

          {/* Contact section */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. How to Apply</h2>
            <p className="mb-4">
              To apply for an open or upcoming role, or to simply introduce yourself, please reach out to us through our Contact page. Include your name, the type of role you are interested in, and a brief note about yourself or a link to your portfolio, resume, or LinkedIn profile.
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
