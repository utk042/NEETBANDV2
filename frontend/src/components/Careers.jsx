import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconMapPin,
  IconBriefcase,
  IconCreditCard,
  IconLoader2,
  IconRocket,
  IconSchool,
  IconUsers,
  IconCheck,
  IconSparkles,
  IconHeartHandshake,
  IconArrowRight,
  IconTarget,
  IconBulb,
  IconShieldCheck
} from '@tabler/icons-react';
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
    <section className="py-20 md:py-28 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-headline-lg font-extrabold text-3xl sm:text-4xl md:text-5xl text-on-surface mb-6 tracking-tight leading-tight">
            Build the Future of Audio Learning with <span className="text-primary">NEET BAND</span>
          </h1>

          <p className="font-body-md text-base md:text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Join a mission-driven team changing how competitive exam aspirants study. We turn complex academic concepts into memorable study songs.
          </p>
        </div>

        {/* Dynamic Open Positions Section */}
        <div id="open-positions" className="mb-24 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <IconBriefcase size={16} />
                <span>Opportunities</span>
              </div>
              <h2 className="font-headline-lg font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
                Open Positions
              </h2>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant/80">
              {positions.length} active position{positions.length === 1 ? '' : 's'} available
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-on-surface-variant gap-3 bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl">
              <IconLoader2 className="animate-spin text-primary" size={28} />
              <span className="text-sm font-medium">Loading open positions...</span>
            </div>
          ) : positions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((pos) => (
                <div
                  key={pos._id}
                  className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-[var(--shadow-floating-card)] group"
                >
                  <div>
                    {/* Header: Title & Job Type Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-on-surface text-base leading-snug group-hover:text-primary transition-colors">
                        {pos.title}
                      </h3>
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex-shrink-0">
                        {pos.jobType || 'FULL-TIME'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-on-surface-variant text-xs leading-relaxed mb-5 line-clamp-3">
                      {pos.description}
                    </p>

                    {/* Key Details List */}
                    <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant/90 mb-6 bg-surface-container/30 p-3.5 rounded-2xl border border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <IconMapPin size={15} className="text-primary/80 flex-shrink-0" />
                        <span className="truncate">{pos.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconBriefcase size={15} className="text-primary/80 flex-shrink-0" />
                        <span className="truncate">{pos.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconCreditCard size={15} className="text-primary/80 flex-shrink-0" />
                        <span className="truncate">{pos.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => setSelectedPosition(pos)}
                    className="w-full bg-primary hover:opacity-90 text-on-primary font-bold py-3 px-4 rounded-xl shadow-md shadow-primary/20 text-xs tracking-wider uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer text-center"
                  >
                    APPLY NOW
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-10 text-center max-w-xl mx-auto shadow-[var(--shadow-floating-card)]">
              <IconBriefcase size={40} className="mx-auto text-primary mb-3 opacity-80" />
              <h3 className="font-bold text-on-surface text-lg mb-2">No Specific Openings Right Now</h3>
              <p className="text-on-surface-variant text-xs mb-5 leading-relaxed">
                We are always open to hearing from exceptional talent in Content, Tech, Design, or Marketing!
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Send Open Application</span>
                <IconArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Why Work With Us - Bento Grid */}
        <div className="mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-headline-lg font-bold text-2xl md:text-3xl text-on-surface mb-3 tracking-tight">
              Why Join NEET BAND?
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant/80">
              We empower our team to solve meaningful problems in education, audio, and technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-8 shadow-[var(--shadow-floating-card)]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <IconRocket size={24} />
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-2">Real Student Impact</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Work on an audio-first platform helping lakhs of NEET & JEE aspirants revise key formulas and concepts stress-free.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-8 shadow-[var(--shadow-floating-card)]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <IconBulb size={24} />
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-2">Ownership & Growth</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Flat hierarchy with direct responsibility. You own your projects end-to-end and see your work ship live rapidly.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-8 shadow-[var(--shadow-floating-card)]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <IconUsers size={24} />
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-2">Flexible & Collaborative</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Work in a modern, hybrid or remote-friendly environment with supportive colleagues who value learning and innovation.
              </p>
            </div>

            <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-8 shadow-[var(--shadow-floating-card)]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
                <IconShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-on-surface text-lg mb-2">DPIIT Recognised Startup</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Recognised under DPIIT's Startup India programme with strong product-market fit and clear growth roadmap.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Simple Hiring Process */}
        <div className="mb-20 bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-3xl p-8 md:p-10 shadow-[var(--shadow-floating-card)]">
          <div className="text-center max-w-md mx-auto mb-10">
            <h2 className="font-headline-lg font-bold text-2xl text-on-surface mb-2">
              Our Simple Hiring Process
            </h2>
            <p className="text-xs text-on-surface-variant/80">
              Respectful of your time and designed to give you clarity at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center mb-3 text-sm shadow-md">
                1
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1">Intro Conversation</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                A brief chat to align on your background, aspirations, and role fit.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center mb-3 text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1">Portfolio or Task Review</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                A short practical assignment or portfolio review relevant to the role.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center mb-3 text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1">Final Discussion</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Aligning on expectations, compensation, culture, and onboarding details.
              </p>
            </div>
          </div>
        </div>

        {/* General Application Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 md:p-10 text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <IconHeartHandshake size={24} />
          </div>
          <h3 className="font-bold text-on-surface text-xl md:text-2xl">
            Don't See the Right Role Listed?
          </h3>
          <p className="text-on-surface-variant text-xs md:text-sm max-w-lg leading-relaxed">
            We are always eager to connect with subject experts, developers, designers, voice artists, and growth leaders.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="mt-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Contact Us / Open Application</span>
            <IconArrowRight size={16} />
          </button>
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
