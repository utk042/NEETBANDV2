import React from 'react';
import { IconDiscount, IconBook, IconBrandWhatsapp, IconBellRinging, IconStethoscope, IconEyeglass, IconArmchair } from '@tabler/icons-react';
import bookCoverImg from '../assets/book_cover.png';

export default function StudentHub() {
  const notices = [
    { id: 1, title: "CBSE Class 12 Date Sheet Revised", date: "Oct 24, 2024", tag: "Exam Alert" },
    { id: 2, title: "NEET UG 2025 Registration Opens", date: "Nov 01, 2024", tag: "Important" },
    { id: 3, title: "New Biology Mnemonics Added", date: "Oct 20, 2024", tag: "Content Update" }
  ];

  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300 min-h-screen">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-container-max mx-auto">
        <div className="mb-16">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-3 text-balance">Student Hub</h2>
          <p className="font-body-md font-normal text-lg text-on-surface-variant opacity-80">
            Exclusive wellness offers, premium resources, and important exam notices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Book Discount Premium Spotlight */}
            <div className="bg-surface-container-lowest rounded-3xl border border-primary/20 shadow-[0_8px_30px_rgba(201,162,39,0.05)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="w-48 h-64 rounded-xl flex-shrink-0 shadow-lg overflow-hidden border border-[var(--border-floating-card)] relative group/cover">
                  <img src={bookCoverImg} alt="Protect Your Child's Eyes Book Cover" className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-xs font-bold uppercase tracking-widest mb-4 self-start">
                    <IconDiscount size={16} />
                    50% Exclusive Discount
                  </div>
                  
                  <h3 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface mb-3">
                    "How to Protect Your Child’s Eyes in the Age of Screens"
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-surface-container border border-primary/30 flex items-center justify-center">
                      <IconStethoscope size={16} className="text-primary" />
                    </div>
                    <span className="font-body-md text-sm text-on-surface-variant font-medium">By Dr. Aarofil Shaikh, Ophthalmologist</span>
                  </div>

                  <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                    Screen fatigue is the #1 enemy of NEET preparation. In this definitive guide, Dr. Shaikh provides actionable ophthalmological strategies to reduce digital eye strain, optimize ambient lighting, and utilize the 20-20-20 rule effectively while studying.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                    <div className="flex-1 bg-surface-container border border-[var(--border-floating-card)] rounded-xl px-5 py-3 w-full sm:w-auto flex items-center justify-between">
                      <span className="font-body-md text-sm text-on-surface-variant">Use Code:</span>
                      <span className="font-mono font-bold text-primary tracking-wider text-lg">NEETVISION50</span>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-label-md font-bold transition-colors flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50">
                      <IconBrandWhatsapp size={20} />
                      Share via WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Wellness Offers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-6 md:p-8 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-primary">
                  <IconArmchair size={24} />
                </div>
                <h4 className="font-headline-md text-xl font-bold text-on-surface mb-2">Posture Correction Chair</h4>
                <p className="font-body-md text-sm text-on-surface-variant mb-6">Ergonomic seating designed for 10+ hours of study. 20% off for NeetBand users.</p>
                <a href="#" className="font-label-md text-sm text-primary font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-1 group/link">Claim Offer <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span></a>
              </div>
              <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-6 md:p-8 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform text-primary">
                  <IconEyeglass size={24} />
                </div>
                <h4 className="font-headline-md text-xl font-bold text-on-surface mb-2">Blue-Light Blockers</h4>
                <p className="font-body-md text-sm text-on-surface-variant mb-6">Medical-grade blue light filtering glasses. Buy 1 Get 1 Free.</p>
                <a href="#" className="font-label-md text-sm text-primary font-bold hover:opacity-80 transition-opacity inline-flex items-center gap-1 group/link">Claim Offer <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span></a>
              </div>
            </div>

          </div>

          {/* Sidebar Area - Notice Board */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] overflow-hidden h-full">
              <div className="bg-surface-container px-6 py-5 border-b border-[var(--border-nav-layout)] flex items-center gap-3">
                <IconBellRinging size={24} className="text-primary" />
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Notice Board</h3>
              </div>
              
              <div className="p-0">
                {notices.map((notice, idx) => (
                  <div key={notice.id} className={`p-6 ${idx !== notices.length - 1 ? 'border-b border-[var(--border-nav-layout)]' : ''} hover:bg-surface-container-low transition-colors cursor-pointer group`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        {notice.tag}
                      </span>
                      <span className="text-xs font-body-md text-on-surface-variant">{notice.date}</span>
                    </div>
                    <h4 className="font-headline-md text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                      {notice.title}
                    </h4>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-[var(--border-nav-layout)] bg-surface-container-low/30">
                <button className="w-full py-3 rounded-xl border border-[var(--border-floating-card)] text-on-surface font-label-md text-sm hover:bg-surface-container transition-colors">
                  View All Notices
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
