import React from 'react';
import { IconCheck, IconTarget, IconUsers, IconX } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';
import memberAarofil from '../assets/member_aarofil.png';
import memberSarah from '../assets/member_sarah.png';
import memberVikram from '../assets/member_vikram.png';

export default function AboutUs() {
  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <img src={logoImg} alt="NeetBand Logo" className="h-16 md:h-20 mx-auto mb-8" loading="lazy" />
          <h1 className="font-headline-lg font-extrabold text-4xl md:text-6xl text-on-surface mb-6 tracking-tight text-balance">
            Turning Textbooks into <span className="text-primary">Symphonies.</span>
          </h1>
          <p className="font-body-md text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            We are pioneering auditory learning to help NEET aspirants memorize complex syllabus structures effortlessly, fighting screen fatigue one track at a time.
          </p>
        </div>

        {/* DPIIT Recognition Banner */}
        <div className="bg-primary/8 border border-primary/25 p-6 rounded-2xl mb-20 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-surface shadow-sm border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary">₹</span>
          </div>
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">Recognized EdTech Innovator</h3>
            <p className="font-body-md text-on-surface-variant">
              Proudly marching towards <strong className="text-on-surface">DPIIT-recognized Startup India</strong> status (Under Process).
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center mb-6 shadow-sm">
              <IconTarget className="text-primary" size={24} />
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-4">Our Vision</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed text-lg">
              To eliminate rote memorization and screen-induced burnout from competitive exam preparation. We envision a world where learning is passive, musical, and inherently memorable.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center mb-6 shadow-sm">
              <IconUsers className="text-primary" size={24} />
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-4">Our Mission</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed text-lg">
              To curate the entire NEET Biology, Physics, and Chemistry syllabus into high-fidelity, rhythmically structured audio tracks that leverage human auditory memory.
            </p>
          </div>
        </div>

        {/* The Problem & Solution */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] p-8 md:p-12 mb-20">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-8">Why Audio?</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <IconX size={16} className="text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-lg mb-2">The Problem: Screen Fatigue & Passive Reading</h4>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  Aspirants spend 10+ hours staring at screens and textbooks. This leads to severe eye strain, postural issues, and an illusion of competence where reading feels like learning, but retention remains low.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <IconCheck size={16} className="text-green-500" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-lg mb-2">The Solution: Auditory Mnemonic Processing</h4>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  By encoding complex biological pathways into rhythmic patterns, we engage a different part of the brain. You can listen while walking, resting your eyes, or commuting—turning dead time into active revision.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-12">Built by Educators & Doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center group">
              <div className="w-32 h-32 rounded-full bg-surface-container border-2 border-[var(--border-floating-card)] mb-4 overflow-hidden shadow-md relative">
                <img src={memberAarofil} alt="Dr. Aarofil Shaikh" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <h4 className="font-bold text-on-surface text-lg">Dr. Aarofil Shaikh</h4>
              <p className="text-primary font-label-md text-sm mb-2">Founder & Medical Advisor</p>
              <p className="text-sm text-on-surface-variant font-body-md text-center">Ophthalmologist focusing on digital eye strain prevention.</p>
            </div>
            
            {/* Team Member 2 */}
            <div className="flex flex-col items-center group">
              <div className="w-32 h-32 rounded-full bg-surface-container border-2 border-[var(--border-floating-card)] mb-4 overflow-hidden shadow-md relative">
                <img src={memberSarah} alt="Sarah Khan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <h4 className="font-bold text-on-surface text-lg">Sarah Khan</h4>
              <p className="text-primary font-label-md text-sm mb-2">Lead Curriculum Designer</p>
              <p className="text-sm text-on-surface-variant font-body-md text-center">Former Biology HOD with 15 years of competitive exam coaching.</p>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col items-center group">
              <div className="w-32 h-32 rounded-full bg-surface-container border-2 border-[var(--border-floating-card)] mb-4 overflow-hidden shadow-md relative">
                <img src={memberVikram} alt="Vikram Aditya" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <h4 className="font-bold text-on-surface text-lg">Vikram Aditya</h4>
              <p className="text-primary font-label-md text-sm mb-2">Head of Audio Production</p>
              <p className="text-sm text-on-surface-variant font-body-md text-center">Crafting the rhythmic mnemonic structures and beats.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
