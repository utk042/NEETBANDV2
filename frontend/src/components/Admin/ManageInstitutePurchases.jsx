import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getInstitutePurchases, recordPurchase } from '../../services/api';
import { 
  IconCash, 
  IconSearch, 
  IconReceipt, 
  IconSchool, 
  IconUser, 
  IconFilter, 
  IconArrowsSort, 
  IconX, 
  IconTag,
  IconBuildingBank,
  IconTrendingUp,
  IconUsers,
  IconFileSpreadsheet,
  IconPlus,
  IconCheck,
  IconNumbers,
  IconChevronDown
} from '@tabler/icons-react';

const PLAN_LABELS = {
  premium_scholar: 'Premium Scholar',
  premium: 'Premium Scholar',
  scale_plan: 'Scale Plan',
  inst_20: 'Institute 20 Seats',
  inst_50: 'Institute 50 Seats',
  book_order: 'Book Order',
  custom: 'Custom Plan',
};

const INSTITUTE_PLANS = ['scale_plan', 'inst_20', 'inst_50'];

const formatPlanLabel = (plan) => {
  if (!plan) return 'N/A';
  if (PLAN_LABELS[plan]) return PLAN_LABELS[plan];
  return String(plan)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function CustomDropdown({ 
  icon: Icon, 
  label, 
  value, 
  options, 
  onChange, 
  className = '', 
  buttonClassName = '', 
  menuClassName = '', 
  align = 'left',
  textSize = 'text-xs'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const alignClass = align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-surface-variant/80 hover:bg-surface-variant text-on-surface border border-outline-variant/30 rounded-xl ${textSize} font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-xs ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-on-surface-variant shrink-0" />}
          {label && <span className="text-on-surface-variant font-medium shrink-0">{label}:</span>}
          <span className="truncate font-semibold">{selectedOption?.label}</span>
        </div>
        <IconChevronDown
          size={16}
          className={`text-on-surface-variant shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className={`absolute ${alignClass} mt-1.5 min-w-[180px] w-full max-h-60 overflow-y-auto bg-surface border border-outline-variant/40 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${menuClassName}`}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 ${textSize} font-medium transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-variant/80'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <IconCheck size={14} className="text-primary shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ManageInstitutePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'premium_scholar',
    customUserCount: '',
    amount: '',
    billingCycle: 'yearly',
    businessName: '',
    gstin: '',
    paymentReference: ''
  });

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'institute', 'individual'
  const [planFilter, setPlanFilter] = useState('all'); // 'all', or specific plan string
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc', 'date_asc', 'amount_desc', 'amount_asc', 'name_asc', 'name_desc'

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getInstitutePurchases();
      setPurchases(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  const isInstitutePurchase = (p) => {
    return (
      INSTITUTE_PLANS.includes(p.plan) ||
      (p.plan === 'custom' && (Number(p.customUserCount) > 1 || Boolean(p.shippingDetails?.businessName))) ||
      Boolean(p.shippingDetails?.businessName) ||
      Boolean(p.shippingDetails?.gstin)
    );
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.amount) {
      setModalError('Customer name, email, and amount are required.');
      return;
    }

    if (formData.plan === 'custom') {
      const seats = Number(formData.customUserCount);
      if (!formData.customUserCount || isNaN(seats) || seats < 1) {
        setModalError('Please enter a valid custom user count (at least 1 seat).');
        return;
      }
    }

    try {
      setSubmitting(true);
      const newPurchase = await recordPurchase({
        ...formData,
        amount: Number(formData.amount),
        customUserCount: formData.plan === 'custom' ? Number(formData.customUserCount) : null
      });

      setPurchases(prev => [newPurchase, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        plan: 'premium_scholar',
        customUserCount: '',
        amount: '',
        billingCycle: 'yearly',
        businessName: '',
        gstin: '',
        paymentReference: ''
      });
    } catch (err) {
      setModalError(err.message || 'Failed to record purchase record');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalRev = 0;
    let instCount = 0;
    let instRev = 0;
    let indivCount = 0;
    let indivRev = 0;

    purchases.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalRev += amt;

      if (isInstitutePurchase(p)) {
        instCount++;
        instRev += amt;
      } else {
        indivCount++;
        indivRev += amt;
      }
    });

    return {
      totalCount: purchases.length,
      totalRev,
      instCount,
      instRev,
      indivCount,
      indivRev,
    };
  }, [purchases]);

  // Available unique plans in dataset for filter dropdown
  const availablePlans = useMemo(() => {
    const set = new Set();
    purchases.forEach((p) => {
      if (p.plan) set.add(p.plan);
    });
    return Array.from(set);
  }, [purchases]);

  // Filter & Sort Logic
  const filteredAndSortedPurchases = useMemo(() => {
    return purchases
      .filter((p) => {
        // Search term check
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const userName = (p.user?.name || '').toLowerCase();
          const userEmail = (p.user?.email || '').toLowerCase();
          const userPhone = (p.shippingDetails?.phone || p.user?.phone || '').toLowerCase();
          const businessName = (p.shippingDetails?.businessName || '').toLowerCase();
          const gstin = (p.shippingDetails?.gstin || '').toLowerCase();
          const orderId = (p.razorpayOrderId || '').toLowerCase();
          const payId = (p.razorpayPaymentId || '').toLowerCase();
          const coupon = (p.discountCode || '').toLowerCase();
          const planName = (p.plan || '').toLowerCase();
          const userCountStr = p.customUserCount ? String(p.customUserCount) : '';

          const matches =
            userName.includes(term) ||
            userEmail.includes(term) ||
            userPhone.includes(term) ||
            businessName.includes(term) ||
            gstin.includes(term) ||
            orderId.includes(term) ||
            payId.includes(term) ||
            coupon.includes(term) ||
            planName.includes(term) ||
            userCountStr.includes(term);

          if (!matches) return false;
        }

        // Type filter check
        if (typeFilter === 'institute' && !isInstitutePurchase(p)) return false;
        if (typeFilter === 'individual' && isInstitutePurchase(p)) return false;

        // Plan filter check
        if (planFilter !== 'all' && p.plan !== planFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'date_asc') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'amount_desc') {
          return (b.amount || 0) - (a.amount || 0);
        }
        if (sortBy === 'amount_asc') {
          return (a.amount || 0) - (b.amount || 0);
        }
        if (sortBy === 'name_asc') {
          const nameA = a.user?.name || '';
          const nameB = b.user?.name || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'name_desc') {
          const nameA = a.user?.name || '';
          const nameB = b.user?.name || '';
          return nameB.localeCompare(nameA);
        }
        return 0;
      });
  }, [purchases, searchTerm, typeFilter, planFilter, sortBy]);

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all' || planFilter !== 'all' || sortBy !== 'date_desc';

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPlanFilter('all');
    setSortBy('date_desc');
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'institute', label: 'Institute Only' },
    { value: 'individual', label: 'Individual Only' },
  ];

  const planFilterOptions = [
    { value: 'all', label: 'All Plans' },
    ...availablePlans.map((plan) => ({
      value: plan,
      label: PLAN_LABELS[plan] || plan,
    })),
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Date: Newest First' },
    { value: 'date_asc', label: 'Date: Oldest First' },
    { value: 'amount_desc', label: 'Amount: High to Low' },
    { value: 'amount_asc', label: 'Amount: Low to High' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ];

  const modalPlanOptions = [
    { value: 'premium_scholar', label: 'Premium Scholar' },
    { value: 'inst_20', label: 'Inst 20 (Institute 20 Seats)' },
    { value: 'inst_50', label: 'Inst 50 (Institute 50 Seats)' },
    { value: 'book_order', label: 'Book Order' },
    { value: 'custom', label: '★ Custom Plan' },
  ];

  const modalCycleOptions = [
    { value: 'yearly', label: 'Yearly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-on-surface-variant">Loading all purchases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 border border-error/20 text-error rounded-2xl font-medium flex items-center justify-between">
        <span>{error}</span>
        <button 
          onClick={fetchPurchases}
          className="px-4 py-2 bg-error text-on-error rounded-xl text-sm font-bold hover:bg-error/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2.5 tracking-tight">
            <IconCash className="text-primary" size={32} />
            All Purchases
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            View, search, filter, and record both individual student and institutional purchases.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <IconPlus size={20} stroke={2.5} /> Record Purchase
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-medium text-xs">Total Revenue</p>
              <h3 className="text-2xl md:text-3xl font-bold text-on-surface mt-1">₹{stats.totalRev.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <IconTrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 font-medium">Across {stats.totalCount} completed orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-medium text-xs">Total Purchases</p>
              <h3 className="text-2xl md:text-3xl font-bold text-on-surface mt-1">{stats.totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
              <IconCash size={20} />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 font-medium">Paid and active orders</p>
        </div>

        {/* Institute Purchases */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-medium text-xs">Institute Purchases</p>
              <h3 className="text-2xl md:text-3xl font-bold text-on-surface mt-1">{stats.instCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
              <IconSchool size={20} />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 font-medium">
            ₹{stats.instRev.toLocaleString('en-IN')} revenue
          </p>
        </div>

        {/* Normal / Individual Purchases */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-on-surface-variant font-medium text-xs">Individual Purchases</p>
              <h3 className="text-2xl md:text-3xl font-bold text-on-surface mt-1">{stats.indivCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <IconUsers size={20} />
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-3 font-medium">
            ₹{stats.indivRev.toLocaleString('en-IN')} revenue
          </p>
        </div>

      </div>

      {/* Control Toolbar: Search, Filters & Sorting */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Search user name, email, phone, business, GSTIN, order ID, seats..."
              className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-10 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <IconX size={16} />
              </button>
            )}
          </div>

          {/* Filters & Sorting Custom Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Type Filter Custom Dropdown */}
            <CustomDropdown
              icon={IconFilter}
              label="Type"
              value={typeFilter}
              options={typeOptions}
              onChange={(val) => setTypeFilter(val)}
              className="w-40 sm:w-auto"
            />

            {/* Plan Filter Custom Dropdown */}
            <CustomDropdown
              icon={IconTag}
              label="Plan"
              value={planFilter}
              options={planFilterOptions}
              onChange={(val) => setPlanFilter(val)}
              className="w-44 sm:w-auto"
            />

            {/* Sort Options Custom Dropdown */}
            <CustomDropdown
              icon={IconArrowsSort}
              label="Sort"
              value={sortBy}
              options={sortOptions}
              onChange={(val) => setSortBy(val)}
              className="w-52 sm:w-auto"
              align="right"
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2.5 bg-error/10 hover:bg-error/20 text-error rounded-xl text-xs font-semibold transition-colors border border-error/20 cursor-pointer"
              >
                <IconX size={14} /> Clear Filters
              </button>
            )}

          </div>

        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs text-on-surface-variant pt-1 border-t border-outline-variant/20">
          <span>
            Showing <strong className="text-on-surface font-bold">{filteredAndSortedPurchases.length}</strong> of{' '}
            <strong className="text-on-surface font-bold">{purchases.length}</strong> total purchases
          </span>
          {hasActiveFilters && (
            <span className="text-primary font-medium">Filters applied</span>
          )}
        </div>
      </div>

      {/* Main Table / Empty State */}
      {filteredAndSortedPurchases.length === 0 ? (
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <IconFileSpreadsheet size={48} className="text-on-surface-variant/40 mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">No Purchases Found</h3>
          <p className="text-on-surface-variant text-sm max-w-md">
            {hasActiveFilters 
              ? 'No purchases match your current filter and search criteria. Try resetting your filters.'
              : 'There are currently no completed purchases in the database.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-5 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50 text-on-surface font-semibold text-xs uppercase tracking-wider border-b border-outline-variant/50">
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Customer</th>
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Type</th>
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Plan / Seats</th>
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Business / GSTIN</th>
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-4 sm:px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap text-right min-w-[110px]">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {filteredAndSortedPurchases.map((purchase) => {
                  const isInst = isInstitutePurchase(purchase);
                  const bName = purchase.shippingDetails?.businessName;
                  const gstin = purchase.shippingDetails?.gstin;
                  const phone = purchase.shippingDetails?.phone || purchase.user?.phone;
                  const planDisplayName = formatPlanLabel(purchase.plan);

                  return (
                    <tr key={purchase._id} className="hover:bg-surface-variant/30 transition-colors">
                      
                      {/* Customer Info */}
                      <td className="px-4 sm:px-5 py-4">
                        <div className="font-semibold text-on-surface">
                          {purchase.user?.name || purchase.shippingDetails?.fullName || 'Unknown User'}
                        </div>
                        <div className="text-on-surface-variant text-xs mt-0.5">
                          {purchase.user?.email || purchase.shippingDetails?.email || 'N/A'}
                        </div>
                        {phone && (
                          <div className="text-on-surface-variant/70 text-[11px] mt-0.5 font-mono">
                            {phone}
                          </div>
                        )}
                      </td>

                      {/* Purchase Type Badge */}
                      <td className="px-4 sm:px-5 py-4">
                        {isInst ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            <IconSchool size={14} /> Institute
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <IconUser size={14} /> Individual
                          </span>
                        )}
                      </td>

                      {/* Plan & Seats */}
                      <td className="px-4 sm:px-5 py-4">
                        <div className="font-medium text-on-surface flex items-center gap-2">
                          {planDisplayName}
                          {purchase.plan === 'custom' && purchase.customUserCount && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <IconNumbers size={13} /> {purchase.customUserCount} Seats
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] capitalize text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded border border-outline-variant/30 font-medium">
                            {purchase.billingCycle || 'yearly'}
                          </span>
                          {purchase.discountCode && (
                            <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-bold">
                              {purchase.discountCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Business / GSTIN */}
                      <td className="px-4 sm:px-5 py-4">
                        {bName || gstin ? (
                          <div>
                            {bName && (
                              <div className="font-medium text-on-surface text-xs flex items-center gap-1">
                                <IconBuildingBank size={14} className="text-on-surface-variant" />
                                {bName}
                              </div>
                            )}
                            {gstin && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-surface-variant text-on-surface border border-outline-variant/40">
                                GST: {gstin}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant/50 text-xs italic">-</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 sm:px-5 py-4 font-bold text-on-surface text-base">
                        ₹{Number(purchase.amount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Date */}
                      <td className="px-4 sm:px-5 py-4 text-on-surface-variant text-xs whitespace-nowrap">
                        {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Receipt Action */}
                      <td className="px-4 sm:px-6 py-4 text-right whitespace-nowrap min-w-[110px]">
                        <a 
                          href={`/receipt/${purchase._id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface text-xs font-semibold rounded-xl transition-all border border-outline-variant/50 shadow-sm"
                        >
                          <IconReceipt size={16} /> Receipt
                        </a>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl w-full max-w-xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30 mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <IconCash className="text-primary" size={24} />
                  Record Purchase
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Manually add a payment or custom deal record.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="p-4 mb-6 bg-error/10 border border-error/20 text-error text-sm font-medium rounded-xl">
                {modalError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRecordSubmit} className="space-y-4">
              
              {/* Customer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Customer Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Apex Academy"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Customer Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone & Billing Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-20">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Billing Cycle</label>
                  <CustomDropdown
                    value={formData.billingCycle}
                    options={modalCycleOptions}
                    onChange={(val) => setFormData({ ...formData, billingCycle: val })}
                    textSize="text-sm"
                  />
                </div>
              </div>

              {/* Plan Selector & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Purchase Type / Plan <span className="text-error">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.plan}
                    options={modalPlanOptions}
                    onChange={(val) => setFormData({ ...formData, plan: val })}
                    textSize="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Amount (₹) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 4999"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              {/* Conditional Custom User Count Field when plan === 'custom' */}
              {formData.plan === 'custom' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-amber-500 mb-1 flex items-center gap-1.5">
                    <IconNumbers size={16} /> Custom User Count (Seats) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter custom seat count (e.g. 150)"
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    value={formData.customUserCount}
                    onChange={(e) => setFormData({ ...formData, customUserCount: e.target.value })}
                  />
                  <p className="text-[11px] text-amber-500/80 mt-1 font-medium">
                    Specify the total number of student licenses/seats granted with this custom purchase.
                  </p>
                </div>
              )}

              {/* B2B Details: Business Name & GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Business / Institute Name</label>
                  <input
                    type="text"
                    placeholder="Optional business name"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="Optional GSTIN"
                    className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Reference / Notes */}
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Payment Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Bank Transfer Ref / Cash Receipt #"
                  className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  value={formData.paymentReference}
                  onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-variant transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                  ) : (
                    <IconCheck size={18} stroke={2.5} />
                  )}
                  Save Purchase Record
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
