import React from 'react';
import { IconCircleCheck, IconCircleX, IconCrownFilled, IconStarFilled, IconSparkles } from '@tabler/icons-react';
import { Card, CardBody } from './ui/Card';
import Button from './ui/Button';

export default function Pricing({ onUpgrade, onSelectPlan, isLoading, user }) {
  const handlePlanClick = (planId) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else if (onUpgrade) {
      onUpgrade(planId);
    }
  };

  return (
    <section id="pricing" className="py-24 md:py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline/10 to-transparent"></div>
      
      <div className="max-w-container-max mx-auto max-w-6xl relative z-10 px-4 md:px-0">
        <div className="text-center mb-16 md:mb-20" data-gsap="heading">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            <IconSparkles size={16} /> Transparent Plans
          </div>
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl lg:text-5xl text-on-surface mb-5 text-balance">
            Simple, Transparent Pricing
          </h2>
          <p className="font-body-md font-normal text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto opacity-90">
            Invest in higher retention & rank. Choose the plan that fits your learning goals.
          </p>
        </div>
        
        <div data-gsap="pricing-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <Card hover className="flex flex-col h-full border border-outline-variant/30">
            <CardBody className="flex flex-col justify-between h-full p-6 md:p-8">
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mb-2 font-bold">Basic Listener</h3>
                  <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-6">Perfect for trying out the methodology.</p>
                  <div className="font-display-lg text-[40px] md:text-[44px] font-bold text-on-surface">
                    ₹0 <span className="font-body-md text-sm text-on-surface-variant font-normal">/ forever</span>
                  </div>
                </div>
                <div className="w-full text-left border-t border-outline-variant/20 pt-6">
                  <ul className="space-y-3.5">
                    <li className="flex items-center gap-3 text-on-surface-variant font-body-md text-sm">
                      <IconCircleCheck size={20} className="text-emerald-500/70 dark:text-emerald-400/70 flex-shrink-0" /> Access to sample study tracks
                    </li>
                    <li className="flex items-center gap-3 text-on-surface-variant font-body-md text-sm">
                      <IconCircleCheck size={20} className="text-emerald-500/70 dark:text-emerald-400/70 flex-shrink-0" /> Basic synced lyrics
                    </li>
                    <li className="flex items-center gap-3 text-on-surface-variant/50 font-body-md text-sm line-through">
                      <IconCircleX size={20} className="text-red-400/50 flex-shrink-0" /> No offline downloads
                    </li>
                    <li className="flex items-center gap-3 text-on-surface-variant/50 font-body-md text-sm line-through">
                      <IconCircleX size={20} className="text-red-400/50 flex-shrink-0" /> No MCQ Quizzes or PDFs
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                {user?.isPremium ? (
                  <Button variant="secondary" fullWidth className="cursor-default opacity-60 pointer-events-none">
                    Included in Premium
                  </Button>
                ) : (
                  <Button variant="secondary" fullWidth className="cursor-default opacity-80 pointer-events-none">
                    Current Plan
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
          
          {/* Premium Tier (Monthly) */}
          <Card highlight hover className="flex flex-col h-full relative border-2 border-primary shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm text-xs px-5 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-md z-10 flex items-center gap-1.5">
              <IconCrownFilled size={14} /> Most Popular
            </div>
            
            <CardBody className="flex flex-col justify-between h-full p-6 md:p-8 pt-8">
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-headline-md text-xl md:text-2xl text-primary mb-2 font-bold flex items-center justify-center gap-2">
                    Premium Scholar
                  </h3>
                  <p className="font-body-md text-xs md:text-sm text-on-surface-variant mb-6">Unlock full audio study courses & mnemonics.</p>
                  <div className="font-display-lg text-[44px] md:text-[48px] font-bold text-on-surface">
                    ₹299
                    <span className="font-body-md text-sm text-on-surface-variant font-normal"> / month</span>
                  </div>
                </div>
                <div className="w-full text-left border-t border-outline-variant/20 pt-6">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Full 2000+ tracks & mnemonics
                    </li>
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Unlimited offline PWA downloads
                    </li>
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Active recall MCQ quizzes
                    </li>
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> 100% Ad-free audio player
                    </li>
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Free biannual eye check-up voucher
                    </li>
                    <li className="flex items-center gap-3 text-on-surface font-body-md text-sm font-medium">
                      <IconCircleCheck size={20} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> 25% discount on academic prep books
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                {user?.isPremium ? (
                  <Button variant="outline" fullWidth className="cursor-default opacity-80 pointer-events-none font-bold">
                    Active Subscription
                  </Button>
                ) : (
                  <Button onClick={() => handlePlanClick('premium_scholar')} disabled={isLoading} fullWidth className="font-bold py-3.5">
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Upgrade to Premium"
                    )}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
