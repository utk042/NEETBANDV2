import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMapPin, IconBriefcase, IconCreditCard, IconLoader2 } from '@tabler/icons-react';
import { getPublicJobPositions } from '../services/api';
import ApplyJobModal from './ApplyJobModal';

export default function Careers() {
  const navigate = useNavigate();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const data = await getPublicJobPositions();
        setPositions(data || []);
      } catch (err) {
        console.error('Error fetching job positions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  return (
    <section className="py-24 md:py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <header className="mb-16 text-center md:text-left max-w-3xl">
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

        {/* Dynamic Open Positions Section */}
        <div id="open-positions" className="mb-20 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg font-bold text-3xl md:text-4xl text-on-surface mb-3 tracking-tight">
              Open Positions
            </h2>
            <p className="font-body-md text-on-surface-variant/80 text-sm md:text-base max-w-xl mx-auto">
              Find the role that best fits your skills and aspirations.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 text-on-surface-variant gap-3">
              <IconLoader2 className="animate-spin text-primary" size={28} />
              <span className="text-sm font-medium">Loading open positions...</span>
            </div>
          ) : positions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((pos) => (
                <div
                  key={pos._id}
                  className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-7 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-[var(--shadow-floating-card)] group"
                >
                  <div>
                    {/* Header: Title & Job Type Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-bold text-on-surface text-lg leading-snug group-hover:text-primary transition-colors">
                        {pos.title}
                      </h3>
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex-shrink-0">
                        {pos.jobType || 'FULL-TIME'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-on-surface-variant text-xs leading-relaxed mb-6 line-clamp-3">
                      {pos.description}
                    </p>

                    {/* Key Details List */}
                    <div className="flex flex-col gap-3 text-xs text-on-surface-variant/90 mb-6">
                      <div className="flex items-start gap-2.5">
                        <IconMapPin size={16} className="text-primary/70 mt-0.5 flex-shrink-0" />
                        <span>{pos.location}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <IconBriefcase size={16} className="text-primary/70 mt-0.5 flex-shrink-0" />
                        <span>{pos.experience}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <IconCreditCard size={16} className="text-primary/70 mt-0.5 flex-shrink-0" />
                        <span>{pos.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => setSelectedPosition(pos)}
                    className="w-full bg-surface-container/80 hover:bg-primary text-on-surface hover:text-on-primary font-bold py-3.5 px-4 rounded-xl border border-outline-variant/30 text-xs tracking-wider uppercase transition-all duration-200 active:scale-[0.98] cursor-pointer text-center shadow-sm"
                  >
                    APPLY NOW
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-8 text-center max-w-xl mx-auto shadow-[var(--shadow-floating-card)]">
              <p className="text-on-surface-variant text-sm mb-4">
                We currently don't have any specific open positions published, but we are always looking for passionate talent!
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs transition-all hover:opacity-90 cursor-pointer shadow-md shadow-primary/20"
              >
                Reach Out to Us →
              </button>
            </div>
          )}
        </div>

        {/* General Culture & Values Content */}
        <div className="max-w-3xl mx-auto prose-legal flex flex-col gap-12 text-on-surface-variant font-body-md leading-[1.8] text-[15px] border-t border-[var(--border-nav-layout)] pt-16">

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
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">4. Our Hiring Process</h2>
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

          {/* Section 5 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">5. Values We Look For</h2>
            <ul className="flex flex-col gap-2 pl-5 list-disc marker:text-on-surface-variant/40">
              <li>Genuine interest in education and student success</li>
              <li>Ownership mindset — you take responsibility for your work</li>
              <li>Clear communicator who gives and receives feedback well</li>
              <li>Curiosity, adaptability, and willingness to learn</li>
              <li>Ability to work independently in a remote or semi-remote setup</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">6. Equal Opportunity</h2>
            <p>
              NEET BAND is an equal opportunity employer. We do not discriminate on the basis of gender, religion, caste, nationality, disability, age, or any other protected characteristic. We are committed to building a diverse and inclusive team where everyone can contribute and grow.
            </p>
          </div>

          {/* Contact section */}
          <div className="border-t border-[var(--border-nav-layout)] pt-10 mt-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">7. How to Apply</h2>
            <p className="mb-4">
              To apply for an open role above, click the <strong className="text-on-surface">APPLY NOW</strong> button on any job card. For general inquiries, feel free to reach out to us through our Contact page.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-label-md text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-md shadow-primary/20"
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

      {/* Apply Job Modal */}
      <ApplyJobModal
        position={selectedPosition}
        isOpen={!!selectedPosition}
        onClose={() => setSelectedPosition(null)}
      />
    </section>
  );
}
