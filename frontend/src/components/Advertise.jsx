import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Advertise() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto">

        <header className="mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl md:text-5xl text-on-surface mb-4 tracking-tight">
            Advertise on NEET BAND
          </h1>
          <p className="font-body-md text-base text-on-surface-variant leading-relaxed">
            Reach thousands of focused, high-intent students preparing for NEET, JEE, board exams, and other competitive examinations through NEET BAND's audio-first learning platform.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant/70 mt-2 font-medium">
            Our audience is engaged, motivated, and actively seeking tools, resources, and services that support their academic journey. If your brand speaks to students, parents, or educators, NEET BAND offers a unique and impactful advertising channel.
          </p>
        </header>

        <div className="prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px]">

          {/* Section 1 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">1. Our Audience</h2>
            <p className="mb-3">
              NEET BAND serves students across India who are preparing for entrance exams and board examinations. Our core audience includes:
            </p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Class 11 and Class 12 students preparing for NEET and JEE</li>
              <li>Students revising for CBSE, ICSE, and state board examinations</li>
              <li>Parents and guardians supporting their children's academic goals</li>
              <li>Teachers, tutors, and coaching centre educators</li>
              <li>Students aged 15–25 from Tier 1, Tier 2, and Tier 3 cities across India</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">2. Why Advertise With Us</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Access a highly targeted student and parent audience</li>
              <li>Audio advertising reaches users who are actively listening and engaged</li>
              <li>Brand association with a trusted, educational, and student-first platform</li>
              <li>Formats including audio ads, sponsored content, and banner placements</li>
              <li>DPIIT-recognised startup with transparent practices and professional standards</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">3. Advertising Formats</h2>
            <p className="mb-3">We offer flexible advertising options to suit different campaign objectives and budgets:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li><strong className="text-on-surface">Audio Pre-roll Ads</strong> — Short audio spots that play before or between study songs for free-tier users</li>
              <li><strong className="text-on-surface">Sponsored Study Content</strong> — Brand integrations within educational audio content in a contextually appropriate manner</li>
              <li><strong className="text-on-surface">Display Banners</strong> — Visual placements on relevant pages of the website</li>
              <li><strong className="text-on-surface">Email Newsletter Sponsorship</strong> — Reach our subscribed student audience via our weekly study newsletter</li>
              <li><strong className="text-on-surface">Custom Campaigns</strong> — Bespoke solutions tailored to your brand goals and target demographic</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Who Can Advertise</h2>
            <p className="mb-3">We welcome advertising from brands and organisations that are relevant, responsible, and aligned with student wellbeing. Suitable advertisers include:</p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Educational institutions, coaching centres, and online learning platforms</li>
              <li>Stationery, books, study tools, and academic supply brands</li>
              <li>Ed-Tech products and services for students</li>
              <li>Healthcare, nutrition, and wellness brands relevant to student health</li>
              <li>Financial services and scholarship programmes for students</li>
              <li>Parent-facing products and family services</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Advertising Standards</h2>
            <p className="mb-3">
              We are committed to maintaining a safe, honest, and respectful environment for our student users. All advertising on NEET BAND must comply with the following standards:
            </p>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Ads must not be misleading, deceptive, or make unverifiable claims</li>
              <li>No advertising of gambling, tobacco, alcohol, adult content, or politically sensitive material</li>
              <li>All claims must comply with applicable Indian advertising regulations and guidelines</li>
              <li>Ads must be clearly distinguishable from editorial or educational content</li>
              <li>NEET BAND reserves the right to reject any advertisement that does not meet our standards</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Pricing and Packages</h2>
            <p className="mb-3">
              Advertising rates and packages are determined based on format, duration, targeting, and campaign requirements. We offer both short-term campaign slots and longer-term partnership arrangements.
            </p>
            <p>
              Please contact us to discuss your campaign goals, and we will provide a tailored proposal with available formats and pricing that match your budget and objectives.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. Disclaimer</h2>
            <p>
              Advertising on NEET BAND does not imply endorsement of the advertiser's products or services by NEET BAND. Users are advised to independently evaluate any product, service, or offer promoted through advertisements on our platform.
            </p>
          </div>

          {/* Contact section */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">8. Get in Touch</h2>
            <p className="mb-4">
              To enquire about advertising opportunities, request a media kit, discuss campaign options, or get a custom quote, please reach out to us through our Contact page. We aim to respond to all advertising enquiries within 2 business days.
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
