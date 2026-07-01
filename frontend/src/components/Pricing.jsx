import React from 'react';
import { IconCircleCheck, IconCircleX, IconCrownFilled } from '@tabler/icons-react';

export default function Pricing({ onUpgrade, isLoading, user }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline/10 to-transparent"></div>
      
      {/* Background Ambient Glows */}
      <div className="absolute top-12 left-1/4 w-[300px] h-[300px] rounded-full bg-secondary-container/40 dark:bg-secondary/10 blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-12 right-1/4 w-[350px] h-[350px] rounded-full bg-primary/12 blur-[120px] pointer-events-none z-0"></div>
      
      <div className="max-w-container-max mx-auto max-w-5xl relative z-10 px-4 md:px-0">
        <div className="text-center mb-20" data-gsap="heading">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-5 text-balance">Simple, Transparent Pricing</h2>
          <p className="font-body-md font-normal text-xl text-on-surface-variant opacity-80">Invest in retention. Cancel anytime.</p>
        </div>
        
        <div data-gsap="pricing-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div
            data-gsap="pricing-card"
            data-gsap-hover="card"
            onMouseMove={handleMouseMove}
            className="bg-surface-container-low rounded-3xl p-8 md:p-10 border border-outline/20 relative w-full box-border h-full hover:bg-surface-container transition-colors shadow-sm group"
          >
            {/* Background Glow Container */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden z-0">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgb(var(--color-primary-container) / 0.15), transparent 80%)'
                }}
              />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between items-stretch gap-8">
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-headline-md text-2xl text-on-surface mb-3">Basic Listener</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mb-6">Perfect for trying out the methodology.</p>
                  <div className="font-display-lg text-[44px] md:text-[48px] text-on-surface">₹0 <span className="font-body-md text-base text-on-surface-variant font-normal">/ forever</span></div>
                </div>
                <div className="w-fit mx-auto text-left">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary/70 flex-shrink-0" /> Access to 50 sample songs
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary/70 flex-shrink-0" /> Basic Lyrics sync
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base opacity-40">
                      <IconCircleX size={24} className="flex-shrink-0" /> No offline downloads
                    </li>
                  </ul>
                </div>
              </div>
              {user?.isPremium ? (
                <button 
                  disabled
                  className="w-full border border-outline/20 text-on-surface-variant font-label-md text-base py-4 rounded-xl transition-all bg-surface cursor-default opacity-60"
                >
                  Included in Premium
                </button>
              ) : (
                <button className="w-full border border-outline/20 hover:border-primary text-on-surface font-label-md text-base py-4 rounded-xl transition-all bg-surface hover:bg-surface-container active:scale-[0.98] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-default opacity-80">
                  Current Plan
                </button>
              )}
            </div>
          </div>
          
          {/* Premium Tier */}
          <div
            onMouseMove={handleMouseMove}
            className="bg-surface-container rounded-3xl p-8 md:p-10 border-2 border-primary shadow-sm relative w-full box-border h-full group"
          >
            {/* Background Glow Container */}
            <div className="pointer-events-none absolute inset-0 rounded-[22px] overflow-hidden z-0">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgb(var(--color-primary-container) / 0.15), transparent 80%)'
                }}
              />
            </div>

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm text-xs px-6 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm z-10">
              Most Popular
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between items-stretch gap-8">
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-headline-md text-2xl md:text-3xl text-primary mb-3 flex items-center justify-center gap-2">
                    Premium Scholar <IconCrownFilled size={24} className="text-primary" />
                  </h3>
                  <p className="font-body-md text-sm text-on-surface-variant mb-6">Unlock the full potential of auditory learning.</p>
                  <div className="font-display-lg text-[50px] md:text-[56px] text-on-surface">
                    ₹299
                    <span className="font-body-md text-base text-on-surface-variant font-normal">/ month</span>
                  </div>
                </div>
                <div className="w-fit mx-auto text-left">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary flex-shrink-0" /> Full library of 2000+ songs
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary flex-shrink-0" /> Unlimited offline downloads
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary flex-shrink-0" /> Integrated MCQ quizzes
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-primary flex-shrink-0" /> Ad-free experience
                    </li>
                  </ul>
                </div>
              </div>
              


              {user?.isPremium ? (
                <button 
                  className="w-full border-2 border-primary text-primary font-label-md text-base py-4 rounded-xl transition-all bg-transparent cursor-default font-bold opacity-80"
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  onClick={onUpgrade}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-label-md text-base py-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-[1px] duration-300 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
