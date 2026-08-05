import React from 'react';
import { IconTarget } from '@tabler/icons-react';
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
        {/* Simple Paragraphs Section */}
        <div className="mb-20 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                What is Neet Band
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              NEET BAND transforms exam prep into <span className="text-primary">Songs</span>.
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                Students who struggle in studies can still remember hundreds of songs perfectly — that’s the power of rhythm and catchy tunes. At NEET BAND, we use that same science to convert the syllabus into easy, memorable study songs so students can understand and retain difficult concepts much faster.
              </p>
              <p>
                These songs also help students revise anywhere — while travelling, walking, or during short breaks — without needing books.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-outline/10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-sm bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-sm"></div>
              </div>
              <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-on-surface-variant font-mono">
                Why Audio Learning?
              </h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              Science-backed auditory memory to beat <span className="text-primary">Screen Fatigue</span>.
            </h2>
            <div className="font-body-md text-base md:text-lg text-on-surface-variant/90 leading-relaxed space-y-4 max-w-3xl">
              <p>
                Aspirants spend 10+ hours staring at screens and textbooks. This leads to severe eye strain, postural issues, and an illusion of competence where reading feels like learning, but retention remains low.
              </p>
              <p>
                By encoding complex biological pathways and concepts into rhythmic audio structures, we engage auditory memory pathways in the brain—allowing effortless recall without screen strain.
              </p>
            </div>
          </div>

        </div>

        {/* Team Section */}
        <div className="text-center pt-8 border-t border-outline/10">
          <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface mb-12">Team & Administration</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-full aspect-[4/5] rounded-3xl bg-surface-container-low border border-[var(--border-floating-card)] mb-5 overflow-hidden relative shadow-sm">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-top" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container/50">
                      <span className="text-4xl font-bold text-primary/40 font-headline-md">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <h4 className="font-extrabold text-on-surface text-xl mb-1">{member.name}</h4>
                <p className="text-primary font-bold text-sm mb-1.5">{member.role}</p>
                <p className="text-sm text-on-surface-variant/80 font-medium text-center">{member.degree}</p>
                
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-xs text-on-surface-variant/50 hover:text-primary mt-2 transition-colors">
                    {member.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
