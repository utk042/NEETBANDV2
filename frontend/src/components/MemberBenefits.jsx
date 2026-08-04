import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconSparkles, 
  IconGift, 
  IconSearch, 
  IconLock, 
  IconCopy, 
  IconCheck, 
  IconExternalLink,
  IconX,
  IconTag,
  IconClock,
  IconBook,
  IconStethoscope
} from '@tabler/icons-react';

const STATIC_BENEFITS = [
  {
    _id: 'benefit-eye-checkup',
    title: 'Biannual Eye Check-up',
    provider: 'Partner Vision Clinics',
    category: 'Health',
    offerType: 'Free Service',
    timing: 'Biannual',
    description: 'Complimentary biannual comprehensive eye examination and vision health check-up for enrolled members.',
    memberValue: 'Free',
    link: '/offers/eye-checkup',
    code: 'EYEFREE2026',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    isComingSoon: false
  },
  {
    _id: 'benefit-book-discount',
    title: 'Book Discount',
    provider: 'NEET Study Store & Publishers',
    category: 'Learning',
    offerType: '25% Discount',
    timing: 'Ongoing',
    description: 'Exclusive 25% discount on medical textbooks, reference guides, practice question banks and prep material.',
    memberValue: '25% off',
    code: 'NEETBOOKS25',
    link: '/offers/book',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    isComingSoon: false
  },
  {
    _id: 'benefit-wellness-growth',
    title: 'Student Growth & Wellness Offers',
    provider: 'Wellness & Mentorship Partners',
    category: 'Lifestyle',
    offerType: 'Special Perk Pack',
    timing: 'Coming Soon',
    description: 'Curated mental health & student wellness sessions, fitness perks, and 1-on-1 expert mentorship benefits launching soon.',
    memberValue: 'Coming Soon',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    isAvailable: true,
    isComingSoon: true
  }
];

export default function MemberBenefits({ user = { isLoggedIn: false }, onUpgradeClick }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const isPremium = user?.isLoggedIn && (user?.isPremium || user?.role === 'admin' || user?.role === 'owner');
  const isLoggedInFree = user?.isLoggedIn && !isPremium;

  // Category counters from static benefits
  const categoryCounts = {
    All: STATIC_BENEFITS.length,
    Health: STATIC_BENEFITS.filter(b => b.category === 'Health').length,
    Learning: STATIC_BENEFITS.filter(b => b.category === 'Learning').length,
    Lifestyle: STATIC_BENEFITS.filter(b => b.category === 'Lifestyle').length,
  };

  const filteredBenefits = STATIC_BENEFITS.filter(b => {
    const matchesTab = activeTab === 'All' || b.category === activeTab;
    const matchesSearch = 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCardClick = (benefit) => {
    if (benefit.isComingSoon) return;
    if (isPremium) {
      if (benefit.link && benefit.link.startsWith('/')) {
        navigate(benefit.link);
      } else if (benefit.link && benefit.link.startsWith('http')) {
        window.open(benefit.link, '_blank');
      } else {
        setSelectedBenefit(benefit);
      }
    } else if (isLoggedInFree) {
      if (onUpgradeClick) {
        onUpgradeClick();
      } else {
        navigate('/pricing');
      }
    } else {
      navigate('/login', { state: { from: { pathname: '/benefits' } } });
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="pt-28 md:pt-36 pb-32 px-gutter min-h-screen bg-transparent transition-colors duration-300">
      <div className="max-w-container-max mx-auto space-y-10">

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-headline-lg text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.15]">
            Member Benefits crafted for student's health, mind & lifestyle
          </h1>

          <p className="font-body-md text-base sm:text-lg text-on-surface-variant leading-relaxed opacity-90">
            Enjoy curated discounts on books, complimentary biannual eye check-ups, partner offers and a growing collection of perks — all included with your membership.
          </p>
        </div>

        {/* Category Filters Bar & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-label-md text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                activeTab === 'All'
                  ? 'bg-on-surface text-surface dark:bg-primary dark:text-on-primary'
                  : 'bg-surface-container-lowest border border-[var(--border-floating-card)] text-on-surface hover:border-primary/40'
              }`}
            >
              <IconGift size={16} /> All Benefits
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'All'
                  ? 'bg-surface/20 text-current'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {categoryCounts.All}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Health')}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-label-md text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                activeTab === 'Health'
                  ? 'bg-on-surface text-surface dark:bg-primary dark:text-on-primary'
                  : 'bg-surface-container-lowest border border-[var(--border-floating-card)] text-on-surface hover:border-primary/40'
              }`}
            >
              <IconStethoscope size={16} /> Health
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'Health'
                  ? 'bg-surface/20 text-current'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {categoryCounts.Health}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Learning')}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-label-md text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                activeTab === 'Learning'
                  ? 'bg-on-surface text-surface dark:bg-primary dark:text-on-primary'
                  : 'bg-surface-container-lowest border border-[var(--border-floating-card)] text-on-surface hover:border-primary/40'
              }`}
            >
              <IconBook size={16} /> Learning
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'Learning'
                  ? 'bg-surface/20 text-current'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {categoryCounts.Learning}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Lifestyle')}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-label-md text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                activeTab === 'Lifestyle'
                  ? 'bg-on-surface text-surface dark:bg-primary dark:text-on-primary'
                  : 'bg-surface-container-lowest border border-[var(--border-floating-card)] text-on-surface hover:border-primary/40'
              }`}
            >
              <IconSparkles size={16} /> Lifestyle
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'Lifestyle'
                  ? 'bg-surface/20 text-current'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {categoryCounts.Lifestyle}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search benefits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-lowest border border-[var(--border-floating-card)] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs font-medium"
            />
          </div>
        </div>

        {/* Benefits Grid */}
        {filteredBenefits.length === 0 ? (
          <div className="py-20 text-center bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8">
            <IconGift size={48} className="mx-auto text-primary/40 mb-3" />
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1">No benefits found</h3>
            <p className="font-body-md text-sm text-on-surface-variant">Try selecting another category or searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredBenefits.map((benefit) => (
              <div
                key={benefit._id}
                className={`bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-xl group ${
                  benefit.isComingSoon ? 'opacity-90' : ''
                }`}
              >
                {/* Image Container with Floating Badge */}
                <div className="h-52 bg-surface-container relative overflow-hidden">
                  <img
                    src={benefit.imageUrl}
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-surface/90 dark:bg-surface-container/90 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-on-surface shadow-md border border-[var(--border-floating-card)] flex items-center gap-1.5">
                    {benefit.category}
                  </div>

                  {/* Coming Soon Badge overlay */}
                  {benefit.isComingSoon && (
                    <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1 animate-pulse">
                      <IconClock size={13} /> Coming Soon
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Meta Tags Row */}
                    <div className="flex items-center gap-3 text-xs font-label-md text-on-surface-variant font-medium mb-3">
                      <span className="inline-flex items-center gap-1 text-primary font-bold">
                        <IconTag size={14} /> {benefit.offerType}
                      </span>
                      <span className="opacity-40">•</span>
                      <span className="inline-flex items-center gap-1">
                        <IconClock size={14} /> {benefit.timing}
                      </span>
                    </div>

                    {/* Title & Provider */}
                    <h3 className="font-headline-md text-xl font-bold text-on-surface mb-1.5 leading-snug group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant font-medium mb-3">
                      by <span className="text-on-surface font-semibold">{benefit.provider}</span>
                    </p>

                    {/* Description */}
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Footer Row (Benefit Value + Redeem/Unlock Button) */}
                  <div className="pt-4 border-t border-[var(--border-nav-layout)] flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-[10px] font-label-md font-bold uppercase tracking-widest text-on-surface-variant opacity-70">
                        Benefit Value
                      </div>
                      <div className="font-headline-md text-lg font-extrabold text-on-surface">
                        {benefit.memberValue}
                      </div>
                    </div>

                    {/* Tier-Aware Action Button */}
                    {benefit.isComingSoon ? (
                      <button
                        disabled
                        className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/40 text-on-surface-variant/70 rounded-2xl font-label-md text-xs font-bold cursor-not-allowed flex items-center gap-1.5 opacity-80"
                      >
                        <IconClock size={14} /> Coming Soon...
                      </button>
                    ) : isPremium ? (
                      <button
                        onClick={() => handleCardClick(benefit)}
                        className="px-5 py-2.5 bg-on-surface text-surface dark:bg-primary dark:text-on-primary rounded-2xl font-label-md text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2 group/btn cursor-pointer"
                      >
                        <IconGift size={16} /> Redeem
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCardClick(benefit)}
                        className="px-5 py-2.5 bg-surface-container border border-primary/30 text-on-surface hover:border-primary hover:text-primary rounded-2xl font-label-md text-xs font-bold transition-all shadow-sm flex items-center gap-2 group/btn cursor-pointer"
                      >
                        <IconLock size={14} className="text-primary" /> Unlock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Redemption Details Modal (for Premium Members) */}
      {selectedBenefit && (
        <div className="fixed inset-0 z-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-[var(--border-floating-card)] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-floating-card animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedBenefit(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <IconX size={20} />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
              <IconGift size={15} /> {selectedBenefit.category} Offer
            </div>

            <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-2">
              {selectedBenefit.title}
            </h3>
            <p className="text-xs text-on-surface-variant font-medium mb-4">
              Provided by <span className="text-on-surface font-semibold">{selectedBenefit.provider}</span>
            </p>

            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-6">
              {selectedBenefit.description}
            </p>

            {/* Promo Code Box */}
            {selectedBenefit.code && (
              <div className="bg-surface-container border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Coupon Code</div>
                  <div className="font-mono text-lg font-extrabold text-primary">{selectedBenefit.code}</div>
                </div>

                <button
                  onClick={() => handleCopyCode(selectedBenefit.code)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copiedCode ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedBenefit(null)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-floating-card)] text-on-surface font-bold text-xs hover:bg-surface-container transition-colors"
              >
                Close
              </button>

              {selectedBenefit.link && (
                <button
                  onClick={() => {
                    const link = selectedBenefit.link;
                    setSelectedBenefit(null);
                    if (link.startsWith('/')) {
                      navigate(link);
                    } else {
                      window.open(link, '_blank');
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors flex items-center gap-2 shadow-md"
                >
                  Claim & Proceed <IconExternalLink size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
