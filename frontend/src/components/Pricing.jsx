import React, { useState } from 'react';
import { 
  IconCircleCheck, IconCrownFilled, IconUser, IconBuildingSkyscraper, IconMail, IconArrowRight
} from '@tabler/icons-react';
import { Card, CardBody } from './ui/Card';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Pricing({ onUpgrade, onSelectPlan, isLoading, user }) {
  const [planScope, setPlanScope] = useState('individual'); // 'individual' | 'institutional'
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    if (plan.customPrice || plan.id === 'inst_custom') {
      window.location.href = 'mailto:support@neetband.com?subject=Custom%20Institute%20Plan%20Inquiry';
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(plan.id, isYearly);
    } else if (onUpgrade) {
      onUpgrade(plan.id);
    }
  };

  const scrollToCompare = () => {
    const el = document.getElementById('compare-plans-table');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const individualPlans = [
    {
      id: 'free',
      name: 'Free Access',
      badge: null,
      monthlyPrice: 0,
      yearlyPrice: 0,
      subtextLine1: 'Forever Free for students',
      subtextLine2: 'No credit card required',
      description: 'Essential access to sample audio study songs, formulas & preview notes.',
      buttonText: 'Current Plan',
      buttonVariant: 'secondary',
      disabled: true,
      features: [
        'Free sample audio study tracks & formulas',
        'Standard audio player with speed controls',
        'Subject syllabus preview & basic notes',
        'Audio ads enabled during playback'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Scholar',
      badge: 'Most Popular',
      monthlyPrice: 299,
      yearlyPrice: 209,
      yearlyBillingTotal: 2508,
      monthlyBillingTotal: 3588,
      subtextLine1: isYearly ? 'Billed ₹2,508 yearly (save 30%)' : 'Billed monthly',
      subtextLine2: 'Cancel anytime',
      description: 'Full unrestricted access for medical & competitive exam aspirants.',
      buttonText: 'Get Premium Access',
      buttonVariant: 'primary',
      features: [
        'Unrestricted access to all NEET Audio Songs',
        '100% Ad-Free uninterrupted playback',
        'Offline PWA downloads for mobile & desktop',
        'Free Biannual Eye Check-up Clinic Voucher',
        '25% Off Medical Books & Study Material Voucher',
        'Full access to Student Hub & syllabus library'
      ]
    }
  ];

  const institutionalPlans = [
    {
      id: 'inst_20',
      name: '20-User Batch',
      badge: '5% OFF',
      seatCount: 20,
      monthlyPrice: 5681,
      yearlyPrice: 3971,
      yearlyBillingTotal: 47652,
      monthlyBillingTotal: 68172,
      perUserPriceMonthly: 284,
      perUserPriceYearly: 199,
      subtextLine1: `₹${isYearly ? 199 : 284} per student / mo`,
      subtextLine2: isYearly ? 'Billed ₹47,652 yearly' : 'Billed monthly',
      description: 'Designed for small coaching batches & study groups up to 20 students.',
      buttonText: 'Enroll 20-Seat Batch',
      buttonVariant: 'secondary',
      features: [
        '20 Full Premium Student Access Accounts',
        'Full access to Physics, Chemistry & Biology songs',
        'Offline PWA downloads for enrolled students',
        '20x Free Eye Check-up Clinic Vouchers',
        '25% Off Medical Books & Prep Vouchers'
      ]
    },
    {
      id: 'inst_50',
      name: '50-User Batch',
      badge: 'Recommended • 10% OFF',
      seatCount: 50,
      monthlyPrice: 13455,
      yearlyPrice: 9405,
      yearlyBillingTotal: 112860,
      monthlyBillingTotal: 161460,
      perUserPriceMonthly: 269,
      perUserPriceYearly: 188,
      subtextLine1: `₹${isYearly ? 188 : 269} per student / mo`,
      subtextLine2: isYearly ? 'Billed ₹1,12,860 yearly' : 'Billed monthly',
      description: 'For established coaching centers & medium institute batches up to 50 students.',
      buttonText: 'Enroll 50-Seat Batch',
      buttonVariant: 'primary',
      features: [
        '50 Full Premium Student Access Accounts',
        'Full access to Physics, Chemistry & Biology songs',
        'Offline PWA downloads for enrolled students',
        '50x Free Eye Check-up Clinic Vouchers',
        '25% Off Medical Books & Prep Vouchers'
      ]
    },
    {
      id: 'inst_custom',
      name: 'Custom Enterprise',
      badge: null,
      customPrice: true,
      priceLabel: 'Custom',
      subtextLine1: 'Tailored pricing for large batches',
      subtextLine2: 'Flexible billing & setup',
      description: 'For large colleges, university campuses, and coaching networks (>50 Seats).',
      buttonText: 'Contact Us',
      buttonVariant: 'secondary',
      features: [
        'Custom student seat allocation (>50 seats)',
        'Direct institute batch onboarding & setup',
        'Discounted per-student batch pricing',
        'All Premium Scholar features for all students',
        'Dedicated email & phone support'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-8 md:py-14 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="max-w-5xl mx-auto z-10 px-4 md:px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="font-headline-lg font-serif text-3xl md:text-4xl font-extrabold text-on-surface mb-4 tracking-tight">
            Simple, Transparent Subscriptions
          </h2>

          {/* Segmented Control Pill: Individuals vs Institutes */}
          <div className="inline-flex p-1 rounded-full bg-surface-container-high/60 border border-outline-variant/30 backdrop-blur-md mb-6 shadow-sm">
            <button
              onClick={() => setPlanScope('individual')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-xs md:text-sm font-bold transition-all duration-300 ${
                planScope === 'individual'
                  ? 'bg-primary text-on-primary shadow-md scale-[1.02]'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              <IconUser size={16} /> For Students
            </button>
            <button
              onClick={() => setPlanScope('institutional')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-xs md:text-sm font-bold transition-all duration-300 ${
                planScope === 'institutional'
                  ? 'bg-primary text-on-primary shadow-md scale-[1.02]'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              <IconBuildingSkyscraper size={16} /> For Institutes & Coaching
            </button>
          </div>

          {/* Billing Cycle Toggle: Monthly vs Yearly */}
          <div className="flex items-center justify-center gap-2.5 text-xs md:text-sm font-medium text-on-surface">
            <span className={!isYearly ? 'font-bold text-on-surface' : 'text-on-surface-variant opacity-80'}>
              Monthly
            </span>
            
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 bg-surface-container-high rounded-full p-0.5 border border-outline-variant/40 transition-colors duration-300 focus:outline-none"
              aria-label="Toggle yearly billing"
            >
              <div
                className={`w-4 h-4 rounded-full bg-primary shadow-sm transform transition-transform duration-300 ${
                  isYearly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={isYearly ? 'font-bold text-on-surface flex items-center gap-1.5' : 'text-on-surface-variant opacity-80'}>
              Yearly <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">Save 30%</span>
            </span>
          </div>
        </div>

        {/* Plan Cards Container */}
        {planScope === 'individual' ? (
          /* 2-Card Layout for Individuals */
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch mb-8">
            {individualPlans.map((plan) => {
              const isFeatured = Boolean(plan.badge);
              const displayPrice = plan.monthlyPrice === 0
                ? '₹0'
                : `₹${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`;

              return (
                <Card
                  key={plan.id}
                  hover
                  className={`flex flex-col rounded-2xl relative transition-all duration-300 overflow-hidden ${
                    isFeatured
                      ? 'border-2 border-primary shadow-xl bg-surface-container-low'
                      : 'border border-outline-variant/30 bg-surface-container/40'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                      <IconCrownFilled size={12} /> {plan.badge}
                    </div>
                  )}

                  <CardBody className="flex flex-col justify-between h-full p-5">
                    <div>
                      {/* Header Block with Uniform Height */}
                      <div className="mb-4">
                        <h3 className="font-headline-md text-lg font-extrabold text-on-surface mb-1">
                          {plan.name}
                        </h3>

                        <div className="flex items-baseline gap-1 my-1">
                          <span className="font-display-lg text-3xl font-black text-on-surface tracking-tight">
                            {displayPrice}
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium">
                            {plan.monthlyPrice === 0 ? '/ month' : '/ user / month'}
                          </span>
                        </div>

                        {/* Subtext block - aligned height */}
                        <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 h-8 flex flex-col justify-center">
                          <p>{plan.subtextLine1}</p>
                          <p className="text-[10px] opacity-70">{plan.subtextLine2}</p>
                        </div>

                        {/* Description block - aligned height */}
                        <p className="text-xs text-on-surface-variant mt-2 leading-snug opacity-90 h-10 flex items-center">
                          {plan.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="mb-4">
                        <Button
                          variant={isFeatured ? 'primary' : 'secondary'}
                          fullWidth
                          onClick={() => handlePlanClick(plan)}
                          disabled={isLoading || (plan.id === 'free' && user?.isLoggedIn && !user?.isPremium)}
                          className="font-bold py-2.5 text-xs rounded-xl"
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            (user?.isLoggedIn && !user?.isPremium && plan.id === 'free') ? 'Current Plan' : plan.buttonText
                          )}
                        </Button>
                      </div>

                      {/* Features List */}
                      <div className="border-t border-outline-variant/20 pt-3.5">
                        <p className="text-[10px] font-extrabold tracking-wider text-on-surface-variant/70 uppercase mb-2">
                          What's Included
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-on-surface font-medium leading-snug">
                              <IconCircleCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          /* 3-Card Layout for Institutes */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch mb-8">
            {institutionalPlans.map((plan) => {
              const isFeatured = Boolean(plan.badge?.includes('Recommended'));
              const displayPrice = plan.customPrice
                ? plan.priceLabel
                : `₹${(isYearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString('en-IN')}`;

              return (
                <Card
                  key={plan.id}
                  hover
                  className={`flex flex-col rounded-2xl relative transition-all duration-300 overflow-hidden ${
                    isFeatured
                      ? 'border-2 border-primary shadow-xl bg-surface-container-low'
                      : 'border border-outline-variant/30 bg-surface-container/40'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                      <IconCrownFilled size={12} /> {plan.badge}
                    </div>
                  )}

                  <CardBody className="flex flex-col justify-between h-full p-5">
                    <div>
                      {/* Header Block with Uniform Height */}
                      <div className="mb-4">
                        <h3 className="font-headline-md text-lg font-extrabold text-on-surface mb-1">
                          {plan.name}
                        </h3>

                        <div className="flex items-baseline gap-1 my-1">
                          <span className="font-display-lg text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                            {displayPrice}
                          </span>
                          {!plan.customPrice && (
                            <span className="text-xs text-on-surface-variant font-medium">
                              / month
                            </span>
                          )}
                        </div>

                        {/* Subtext block - aligned height across all 3 cards */}
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold h-8 flex flex-col justify-center">
                          <p>{plan.subtextLine1}</p>
                          <p className="text-[10px] text-on-surface-variant font-normal opacity-80">{plan.subtextLine2}</p>
                        </div>

                        {/* Description block - aligned height across all 3 cards */}
                        <p className="text-xs text-on-surface-variant mt-2 leading-snug opacity-90 h-10 flex items-center">
                          {plan.description}
                        </p>
                      </div>

                      {/* Action Button - NOW PERFECTLY INLINED */}
                      <div className="mb-4">
                        <Button
                          variant={isFeatured ? 'primary' : 'secondary'}
                          fullWidth
                          onClick={() => handlePlanClick(plan)}
                          disabled={isLoading}
                          className="font-bold py-2.5 text-xs rounded-xl flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <>
                              {plan.customPrice ? <IconMail size={15} /> : null}
                              {plan.buttonText}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Features List */}
                      <div className="border-t border-outline-variant/20 pt-3.5">
                        <p className="text-[10px] font-extrabold tracking-wider text-on-surface-variant/70 uppercase mb-2">
                          Batch Inclusions
                        </p>
                        <ul className="space-y-2">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-on-surface font-medium leading-snug">
                              <IconCircleCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Compare Plans Button */}
        <div className="text-center">
          <button
            onClick={() => {
              if (window.location.pathname === '/pricing') {
                scrollToCompare();
              } else {
                navigate('/pricing');
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface hover:text-primary transition-all py-2 px-5 rounded-full border border-outline-variant/30 hover:border-primary/50 bg-surface-container/30 shadow-sm"
          >
            View more details <IconArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
