import React from 'react';
import { 
  IconCheck, IconX, IconShieldCheck, IconLock, 
  IconHeadset, IconAward, IconSparkles, IconCreditCard
} from '@tabler/icons-react';
import Pricing from './Pricing';
import FAQ from './FAQ';

export default function PricingPage({ user, navigate }) {
  const handleSelectPlan = (planId) => {
    if (!user || !user.isLoggedIn) {
      navigate('/login', { state: { from: { pathname: `/checkout?plan=${planId}` } } });
      return;
    }
    navigate(`/checkout?plan=${planId}`);
  };

  const faqItems = [
    {
      question: "What is included in the Premium Scholar plan?",
      answer: "Premium Scholar gives you unlimited access to our entire library of 2000+ academic audio study tracks across subjects. It includes high-quality offline downloads, interactive MCQ quizzes, ad-free listening, free eye checkup vouchers, and physical book discount coupons."
    },
    {
      question: "Can I download tracks and listen offline?",
      answer: "Yes! Premium Scholar members can save tracks directly inside the NeetBand PWA app on mobile or desktop so you can revise anytime without an internet connection."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support all major Indian and international payment options via Razorpay, including UPI (GPay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking, and Wallets."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with a single click in your dashboard. You will continue to have full access until the end of your billing cycle."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, we offer a 7-day money-back satisfaction guarantee under our standard refund policy if you face technical issues or are dissatisfied with the service."
    }
  ];

  const comparisonFeatures = [
    { name: "Audio Study Songs & Mnemonics", free: "Sample Preview Tracks", premium: "2000+ Full Audio Track Library" },
    { name: "Syllabus & Subject Coverage", free: "Preview Chapters Only", premium: "Comprehensive Academic Library" },
    { name: "Offline Playback & PWA Downloads", free: false, premium: "Unlimited Downloads" },
    { name: "Synced Lyrics & High Quality Audio", free: "Basic Player", premium: "HD Lossless + Synced Lyrics" },
    { name: "Interactive Chapter MCQ Quizzes", free: false, premium: true },
    { name: "Ad-Free Uninterrupted Listening", free: false, premium: true },
    { name: "Biannual Eye Check-up Voucher", free: false, premium: "Complimentary Clinic Check-up" },
    { name: "Academic Prep Books Order Discount", free: false, premium: "25% Off Books Voucher" },
    { name: "Student Learning Hub & Notes", free: "Basic Summaries", premium: "Full Unlimited Access" },
    { name: "Community Forum & Discussion Feed", free: false, premium: true },
  ];

  return (
    <div className="pt-28 pb-32 min-h-screen bg-surface transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Page Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-5 text-balance">
            Choose the Perfect Plan for Your Academic Success
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
        <div className="mt-20 md:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3">
              Detailed Feature Comparison
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base">
              See how our plans stack up side-by-side to make the right choice for your study journey.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-outline-variant/30 bg-surface-container/60 backdrop-blur-md shadow-sm max-w-4xl mx-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-high/60">
                  <th className="py-5 px-6 font-bold text-base text-on-surface w-1/2">Features</th>
                  <th className="py-5 px-4 font-bold text-sm text-center text-on-surface-variant w-1/4">Basic (Free)</th>
                  <th className="py-5 px-4 font-bold text-sm text-center text-primary w-1/4">Premium Scholar (₹299/mo)</th>
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

          <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-container border border-outline-variant/20">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <IconHeadset size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-on-surface mb-0.5">Instant Access & Support</h4>
              <p className="text-xs text-on-surface-variant">Unlock all features immediately after checkout.</p>
            </div>
          </div>
        </div>

        {/* Pricing FAQs Section (Using Homepage FAQ component & styling) */}
        <FAQ 
          items={faqItems} 
          title="Frequently Asked Questions" 
          subtitle="Got questions about billing or subscription plans? We've got answers."
        />

      </div>
    </div>
  );
}
