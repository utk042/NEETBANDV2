import React from 'react';
import { IconCheck, IconTarget, IconUsers, IconX, IconMusic, IconDeviceMobile, IconHeadphones, IconShieldCheck } from '@tabler/icons-react';
import logoImg from '../assets/logo.png';

export default function AboutUs() {
  const ownerImage = "https://neetband.com/wp-content/uploads/2021/02/Dr-Aarofil-Shaikh-682x1024.jpg";

  const teamMembers = [
    {
      name: "Dr Aarofil Shaikh",
      role: "Administration & Founder",
      degree: "MBBS MS DNB (Ophthal)",
      email: "draarofilshaikh@gmail.com",
      image: ownerImage
    },
    {
      name: "Dr Rohit Kale",
      role: "Marketing",
      degree: "MS (Ortho)",
      email: "drkalerohit23@gmail.com",
      image: null
    },
    {
      name: "Farhat Rahaman",
      role: "Technical Management",
      degree: "B.Tech",
      email: "farhat29@gmail.com",
      image: null
    },
    {
      name: "Dr Deepak Patil",
      role: "Student Counsellor",
      degree: "Consultant Diabetologist",
      email: "drdeepakpatil23@gmail.com",
      image: null
    }
  ];

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <img src={logoImg} alt="NeetBand Logo" className="h-16 md:h-20 mx-auto mb-8" loading="lazy" />
          <h1 className="font-headline-lg font-extrabold text-4xl md:text-6xl text-on-surface mb-6 tracking-tight text-balance">
            NEET BAND transforms exam prep into <span className="text-primary">Songs</span>
          </h1>
          <p className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-6">
            Helping students memorize, revise, and stay motivated.
          </p>
          <div className="space-y-4 font-body-md text-base md:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed text-left md:text-center">
            <p>
              Students who struggle in studies can still remember hundreds of songs perfectly — that’s the power of rhythm and catchy tunes.
            </p>
            <p>
              At NEET BAND, we use that same science to convert the syllabus into easy, memorable study songs so students can understand and retain difficult concepts much faster.
            </p>
            <p>
              These songs also help students revise anywhere — while travelling, walking, or during short breaks — without needing books.
            </p>
          </div>
        </div>

        {/* Platform Highlights Banner */}
        <div className="bg-surface-container-lowest border border-[var(--border-floating-card)] p-8 rounded-3xl shadow-[var(--shadow-floating-card)] mb-16">
          <h3 className="font-headline-md text-xl font-bold text-on-surface mb-4">What is NEET BAND?</h3>
          <p className="font-body-md text-on-surface-variant mb-6 leading-relaxed">
            NEET BAND is an education-technology platform with a website similar to Spotify or JioSaavn, but with two important differences:
          </p>
          <div className="space-y-4 pl-4 border-l-2 border-primary">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="font-body-md text-on-surface text-base">
                <strong>Syllabus Aligned:</strong> The entire library contains only study songs, aligned with school and board syllabus.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="font-body-md text-on-surface text-base">
                <strong>No App Downloads:</strong> Students do not need to download any app — everything works directly from the website.
              </p>
            </div>
          </div>
        </div>

        {/* DPIIT Recognition Banner */}
        <div className="bg-primary/8 border border-primary/25 p-6 rounded-2xl mb-16 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 shadow-sm border border-primary/20 flex items-center justify-center flex-shrink-0">
            <IconShieldCheck className="text-primary" size={28} />
          </div>
          <div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">Recognized EdTech Innovator</h3>
            <p className="font-body-md text-on-surface-variant">
              Proudly marching towards <strong className="text-on-surface">DPIIT-recognized Startup India</strong> status (Under Process).
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center mb-6 shadow-sm">
              <IconTarget className="text-primary" size={24} />
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-4">Study Anywhere & Everywhere</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed text-base">
              Turn dead time into active revision. Whether you are commuting, taking a walk, or resting your eyes between intense study sessions, NEET BAND lets you revise seamless audio lessons on the go.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-surface-container border border-[var(--border-floating-card)] flex items-center justify-center mb-6 shadow-sm">
              <IconHeadphones className="text-primary" size={24} />
            </div>
            <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-4">Revision Songs & Counselling</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed text-base">
              NEET BAND also helps students with motivational audio lessons and online counselling. We turn syllabi into music, personalised plans, and exam strategies—so you learn faster, stay focused, and score higher with science-backed guidance.
            </p>
          </div>
        </div>

        {/* Why Audio Section */}
        <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] p-8 md:p-12 mb-20">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-8">Why Audio Learning?</h2>
          
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
                <h4 className="font-bold text-on-surface text-lg mb-2">The Solution: Science-Backed Auditory Memory</h4>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  By encoding complex biological pathways and concepts into rhythmic audio structures, we engage auditory memory pathways in the brain—allowing effortless recall without screen strain.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-4">Team & Administration</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto mb-12">
            Created by doctors and professionals to make exam preparation easier, more effective, and a lot more enjoyable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-32 h-32 rounded-full bg-surface-container border-2 border-[var(--border-floating-card)] mb-4 overflow-hidden shadow-md relative flex items-center justify-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary font-headline-md">
                      {member.name.charAt(0)}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-on-surface text-lg">{member.name}</h4>
                <p className="text-primary font-label-md text-xs font-semibold mb-1">{member.role}</p>
                <p className="text-xs text-on-surface-variant font-body-md text-center">{member.degree}</p>
                <a href={`mailto:${member.email}`} className="text-[11px] text-on-surface-variant/60 hover:text-primary mt-1 transition-colors">
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
