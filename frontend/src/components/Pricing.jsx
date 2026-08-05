import React, { useState, useEffect } from 'react';
import { 
  IconCircleCheck, IconCrownFilled, IconUser, IconBuildingSkyscraper, IconMail, IconArrowRight
} from '@tabler/icons-react';
import { Card, CardBody } from './ui/Card';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Pricing({ onUpgrade, onSelectPlan, isLoading, user }) {
  const [planScope, setPlanScope] = useState('individual'); // 'individual' | 'institutional'
  const isYearly = true;
  const navigate = useNavigate();
  
  const [individualPlans, setIndividualPlans] = useState([]);
  const [institutionalPlans, setInstitutionalPlans] = useState([]);
  const [isFetchingPlans, setIsFetchingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/api/pricing-plans');
        const plans = response.data;
        setIndividualPlans(plans.filter(p => p.category === 'individual'));
        setInstitutionalPlans(plans.filter(p => p.category === 'institutional'));
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
      } finally {
        setIsFetchingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanClick = (plan) => {
    if (plan.customPrice || plan.planId === 'inst_custom') {
      window.location.href = 'mailto:support@neetband.com?subject=Custom%20Institute%20Plan%20Inquiry';
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(plan.planId, true);
    } else if (onUpgrade) {
      onUpgrade(plan.planId);
    }
  };

  const scrollToCompare = () => {
    const el = document.getElementById('compare-plans-table');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isUserPremium = Boolean(user?.isLoggedIn && user?.isPremium);
  const userPlan = user?.membershipPlan || (isUserPremium ? 'premium' : 'free');

  const isCurrentPlan = (planId) => {
    if (!user?.isLoggedIn) {
      return planId === 'free';
    }
    if (!isUserPremium) {
      return planId === 'free';
    }
    if (planId === 'premium' || planId === 'premium_scholar') {
      return userPlan === 'premium' || userPlan === 'premium_scholar';
    }
    return userPlan === planId;
  };

  const getButtonText = (plan) => {
    if (isCurrentPlan(plan.planId)) {
      return 'Current Plan';
    }
    if (plan.planId === 'free') {
      return 'Free Access';
    }
    return plan.buttonText;
  };

  const isButtonDisabled = (plan) => {
    if (isLoading || isFetchingPlans) return true;
    if (isCurrentPlan(plan.planId)) return true;
    if (plan.planId === 'free') return true;
    return false;
  };

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
        </div>

        {isFetchingPlans ? (
          <div className="flex justify-center items-center h-64">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <>
            {/* Plan Cards Container */}
            {planScope === 'individual' ? (
              /* Card Layout for Individuals */
              <div className={`mx-auto grid gap-5 md:gap-6 items-stretch mb-8 justify-center ${
                individualPlans.length === 1 ? 'grid-cols-1 max-w-sm' :
                individualPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl'
              }`}>
                {individualPlans.map((plan) => {
                  const activePlan = isCurrentPlan(plan.planId);
                  const isFeatured = Boolean(plan.badge);
                  const displayPrice = plan.monthlyPrice === 0
                    ? '₹0'
                    : `₹${isYearly ? plan.yearlyPrice : plan.monthlyPrice}`;

                  return (
                    <Card
                      key={plan.planId}
                      hover
                      className={`flex flex-col rounded-2xl relative transition-all duration-300 overflow-hidden ${
                        activePlan
                          ? 'border-2 border-emerald-500 shadow-xl bg-surface-container-low'
                          : isFeatured
                          ? 'border-2 border-primary shadow-xl bg-surface-container-low'
                          : 'border border-outline-variant/30 bg-surface-container/40'
                      }`}
                    >
                      {plan.badge && !activePlan && (
                        <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                          <IconCrownFilled size={12} /> {plan.badge}
                        </div>
                      )}

                      {activePlan && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                          <IconCrownFilled size={12} /> Current Plan
                        </div>
                      )}

                      <CardBody className="flex flex-col justify-between h-full p-5">
                        <div>
                          {/* Header Block with Uniform Height */}
                          <div className="mb-4">
                            <h3 className="font-headline-md text-lg font-extrabold text-on-surface mb-1">
                              {plan.name}
                            </h3>

                            <div className="flex items-baseline gap-1.5 my-1">
                              {plan.originalPrice > 0 && (
                                <span className="text-base font-extrabold text-on-surface-variant/40 line-through decoration-rose-500/80 decoration-2">
                                  ₹{plan.originalPrice}
                                </span>
                              )}
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
                            {plan.planId === 'free' ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl border border-outline-variant/40 bg-surface-container/20 text-on-surface-variant/50 cursor-not-allowed opacity-60 flex items-center justify-center gap-1.5 shadow-none"
                              >
                                {activePlan ? 'Current Plan' : 'Free Access'}
                              </button>
                            ) : activePlan ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-md cursor-default flex items-center justify-center gap-1.5 border border-emerald-500"
                              >
                                <IconCircleCheck size={16} /> Current Plan
                              </button>
                            ) : (
                              <Button
                                variant={plan.buttonVariant === 'primary' ? 'primary' : (isFeatured ? 'primary' : 'secondary')}
                                fullWidth
                                onClick={() => handlePlanClick(plan)}
                                disabled={isLoading}
                                className="font-bold py-2.5 text-xs rounded-xl"
                              >
                                {isLoading ? (
                                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  plan.buttonText
                                )}
                              </Button>
                            )}
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
              /* Card Layout for Institutes */
              <div className={`mx-auto grid gap-4 md:gap-5 items-stretch mb-8 justify-center ${
                institutionalPlans.length === 1 ? 'grid-cols-1 max-w-sm' :
                institutionalPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl'
              }`}>
                {institutionalPlans.map((plan) => {
                  const activePlan = isCurrentPlan(plan.planId);
                  const isFeatured = Boolean(plan.badge?.includes('Recommended') || plan.badge);
                  const displayPrice = plan.customPrice
                    ? plan.priceLabel
                    : `₹${(isYearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString('en-IN')}`;

                  return (
                    <Card
                      key={plan.planId}
                      hover
                      className={`flex flex-col rounded-2xl relative transition-all duration-300 overflow-hidden ${
                        activePlan
                          ? 'border-2 border-emerald-500 shadow-xl bg-surface-container-low'
                          : isFeatured
                          ? 'border-2 border-primary shadow-xl bg-surface-container-low'
                          : 'border border-outline-variant/30 bg-surface-container/40'
                      }`}
                    >
                      {plan.badge && !activePlan && (
                        <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                          <IconCrownFilled size={12} /> {plan.badge}
                        </div>
                      )}

                      {activePlan && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white font-label-sm text-[10px] px-3 py-1 rounded-bl-xl font-extrabold uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                          <IconCrownFilled size={12} /> Current Plan
                        </div>
                      )}

                      <CardBody className="flex flex-col justify-between h-full p-5">
                        <div>
                          {/* Header Block with Uniform Height */}
                          <div className="mb-4">
                            <h3 className="font-headline-md text-lg font-extrabold text-on-surface mb-1">
                              {plan.name}
                            </h3>

                            <div className="flex items-baseline gap-1.5 my-1">
                              {plan.originalPrice > 0 && (
                                <span className="text-sm md:text-base font-extrabold text-on-surface-variant/40 line-through decoration-rose-500/80 decoration-2">
                                  ₹{plan.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="font-display-lg text-2xl md:text-3xl font-black text-on-surface tracking-tight">
                                {displayPrice}
                              </span>
                              {!plan.customPrice && (
                                <span className="text-xs text-on-surface-variant font-medium">
                                  / month
                                </span>
                              )}
                            </div>

                            {/* Subtext block - aligned height across all cards */}
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold h-8 flex flex-col justify-center">
                              <p>{plan.subtextLine1}</p>
                              <p className="text-[10px] text-on-surface-variant font-normal opacity-80">{plan.subtextLine2}</p>
                            </div>

                            {/* Description block - aligned height across all cards */}
                            <p className="text-xs text-on-surface-variant mt-2 leading-snug opacity-90 h-10 flex items-center">
                              {plan.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="mb-4">
                            {activePlan ? (
                              <button
                                disabled
                                className="w-full py-2.5 px-4 text-xs font-extrabold rounded-xl bg-emerald-600 text-white shadow-md cursor-default flex items-center justify-center gap-1.5 border border-emerald-500"
                              >
                                <IconCircleCheck size={16} /> Current Plan
                              </button>
                            ) : (
                              <Button
                                variant={plan.buttonVariant === 'primary' ? 'primary' : (isFeatured ? 'primary' : 'secondary')}
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
                            )}
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
          </>
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
