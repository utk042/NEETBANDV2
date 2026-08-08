import React from 'react';
import { 
  IconCheck, IconX, IconShieldCheck, IconLock, 
  IconHeadset
} from '@tabler/icons-react';
import Pricing from './Pricing';

import FAQ from './FAQ';

export default function PricingPage({ user, navigate }) {
  const handleSelectPlan = (planId) => {
    const billing = 'yearly';
    if (!user || !user.isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/checkout?plan=${planId}&billing=${billing}` } } });
      return;
    }
    navigate(`/checkout?plan=${planId}&billing=${billing}`);
  };

  // Dynamic FAQs are fetched by the FAQ component

  const comparisonFeatures = [
    { name: "Audio Study Songs & Mnemonics", free: "Free Sample Tracks", premium: "Full Library Access" },
    { name: "Syllabus & Subject Coverage", free: "Preview Subject Tracks", premium: "Complete NEET Syllabus" },
    { name: "Offline Playback & PWA Downloads", free: false, premium: "Unlimited Downloads" },
    { name: "Synced Lyrics & Audio Player Controls", free: "Standard Player", premium: "Synced Lyrics & Speed Control" },
    { name: "100% Ad-Free Listening", free: false, premium: true },
    { name: "Biannual Eye Check-up Voucher", free: false, premium: "Complimentary Clinic Voucher" },
    { name: "Academic Books Discount Coupon", free: false, premium: "25% Off Books Voucher" },
    { name: "Student Learning Hub & Notes", free: "Basic Summaries", premium: "Full Access" },
  ];

  return (
    <div className="pt-28 pb-32 min-h-screen bg-surface transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Page Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-5 text-balance">
            Choose the Perfect Plan for Your Success
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed">
            Replace tedious screen reading with science-backed auditory learning. Master complex formulas, biological pathways, and mnemonics anywhere.
          </p>
        </div>

        {/* Plan Cards Section */}
        <Pricing 
          user={user} 
          onSelectPlan={handleSelectPlan}
        />



        {/* Feature Comparison Matrix */}
        <div id="compare-plans-table" className="mt-20 md:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
              Detailed Feature Comparison
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base">
              See how our Free and Premium plans stack up side-by-side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-md shadow-sm max-w-4xl mx-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-high/60">
                  <th className="py-5 px-6 font-bold text-base text-on-surface w-1/2">Features</th>
                  <th className="py-5 px-4 font-bold text-sm text-center text-on-surface-variant w-1/4">Free Plan (₹0)</th>
                  <th className="py-5 px-4 font-bold text-sm text-center text-primary w-1/4">Premium Scholar (₹2,508/yr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-sm text-on-surface">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-on-surface">{row.name}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <IconCheck size={20} className="mx-auto text-emerald-500" /> : <IconX size={20} className="mx-auto text-on-surface-variant/40" />
                      ) : (
                        <span className="text-on-surface-variant text-xs font-semibold">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-primary/5">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? <IconCheck size={20} className="mx-auto text-emerald-500" /> : <IconX size={20} className="mx-auto text-on-surface-variant/40" />
                      ) : (
                        <span className="text-primary font-semibold text-xs">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Trust Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant/20">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <IconLock size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-0.5">256-Bit SSL Encryption</h4>
              <p className="text-xs text-on-surface-variant">100% secure payment processing powered by Razorpay.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant/20">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <IconShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-0.5">DPIIT-Recognised Startup</h4>
              <p className="text-xs text-on-surface-variant">Trusted educational innovation recognized by Startup India.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 border border-outline-variant/20">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <IconHeadset size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-0.5">Instant Access & Support</h4>
              <p className="text-xs text-on-surface-variant">Unlock all features immediately after checkout.</p>
            </div>
          </div>
        </div>

        {/* Pricing FAQs Section */}
        <FAQ 
          pageName="pricing"
          title="Frequently Asked Questions" 
          subtitle="Got questions about billing or subscription plans? We've got answers."
        />

      </div>
    </div>
  );
}
