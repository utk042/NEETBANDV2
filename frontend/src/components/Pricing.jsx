import React from 'react';
import { IconCircleCheck, IconCircleX, IconCrownFilled } from '@tabler/icons-react';
import { Card, CardBody } from './ui/Card';
import Button from './ui/Button';

export default function Pricing({ onUpgrade, isLoading, user }) {
  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline/10 to-transparent"></div>
      
      {/* Background Ambient Glows */}
      
      <div className="max-w-container-max mx-auto max-w-5xl relative z-10 px-4 md:px-0">
        <div className="text-center mb-20" data-gsap="heading">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-5 text-balance">Simple, Transparent Pricing</h2>
          <p className="font-body-md font-normal text-xl text-on-surface-variant opacity-80">Invest in retention. Cancel anytime.</p>
        </div>
        
        <div data-gsap="pricing-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <Card hover>
            <CardBody>
              <div>
                <div className="text-center mb-8">
                  <h3 className="font-headline-md text-2xl text-on-surface mb-3">Basic Listener</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mb-6">Perfect for trying out the methodology.</p>
                  <div className="font-display-lg text-[44px] md:text-[48px] text-on-surface">₹0 <span className="font-body-md text-base text-on-surface-variant font-normal">/ forever</span></div>
                </div>
                <div className="w-fit mx-auto text-left">
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base">
                      <IconCircleCheck size={24} className="text-emerald-500/70 dark:text-emerald-400/70 flex-shrink-0" /> Access to 50 sample songs
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base">
                      <IconCircleCheck size={24} className="text-emerald-500/70 dark:text-emerald-400/70 flex-shrink-0" /> Basic Lyrics sync
                    </li>
                    <li className="flex items-center gap-4 text-on-surface-variant font-body-md text-base opacity-40">
                      <IconCircleX size={24} className="text-red-500/60 dark:text-red-400/60 flex-shrink-0" /> No offline downloads
                    </li>
                  </ul>
                </div>
              </div>
              {user?.isPremium ? (
                <Button variant="secondary" fullWidth className="cursor-default opacity-60 pointer-events-none">
                  Included in Premium
                </Button>
              ) : (
                <Button variant="secondary" fullWidth className="cursor-default opacity-80 pointer-events-none hover:border-primary">
                  Current Plan
                </Button>
              )}
            </CardBody>
          </Card>
          
          {/* Premium Tier */}
          <Card highlight hover>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm text-xs px-6 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-sm z-10">
              Most Popular
            </div>
            
            <CardBody>
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
                      <IconCircleCheck size={24} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Full library of 2000+ songs
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Unlimited offline downloads
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Integrated MCQ quizzes
                    </li>
                    <li className="flex items-center gap-4 text-on-surface font-body-md text-base">
                      <IconCircleCheck size={24} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" /> Ad-free experience
                    </li>
                  </ul>
                </div>
              </div>
              


              {user?.isPremium ? (
                <Button variant="outline" fullWidth className="cursor-default opacity-80 pointer-events-none font-bold">
                  Current Plan
                </Button>
              ) : (
                <Button onClick={onUpgrade} disabled={isLoading} fullWidth className="font-bold">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
