import React, { useState, useEffect } from 'react';
import { 
  IconTag, 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconCheck, 
  IconX, 
  IconRefresh, 
  IconInfoCircle,
  IconCalendar,
  IconSearch,
  IconInfinity,
  IconCopy,
  IconStack2
} from '@tabler/icons-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, bulkCreateCoupons } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';

export default function ManageCoupons() {
  const { confirm } = useDialog();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selection state for bulk copy
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState('');
  
  // Bulk generate modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form fields matching MemberPress Coupon options
  const [code, setCode] = useState('');
  const [isMembershipSpecific, setIsMembershipSpecific] = useState(false);
  const [discountValue, setDiscountValue] = useState(10);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountMode, setDiscountMode] = useState('Standard');
  
  // Limits
  const [hasUsageCountMax, setHasUsageCountMax] = useState(false);
  const [usageCountMax, setUsageCountMax] = useState('');
  
  const [hasUsageLimitPerUser, setHasUsageLimitPerUser] = useState(false);
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('');
  
  const [usageLimitPerUserTimeframe, setUsageLimitPerUserTimeframe] = useState('Lifetime');
  const [allowOnUpgradesDowngrades, setAllowOnUpgradesDowngrades] = useState('No');
  const [allowOnlyIfCustomerAlreadyUsed, setAllowOnlyIfCustomerAlreadyUsed] = useState('Unset');
  
  // Schedule
  const [scheduleStartEnabled, setScheduleStartEnabled] = useState(false);
  const [startDate, setStartDate] = useState('');
  
  const [expireEnabled, setExpireEnabled] = useState(false);
  const [expireDate, setExpireDate] = useState('');
  
  // Applicable memberships / plans
  const [applicableMemberships, setApplicableMemberships] = useState(['all']);

  const availablePlans = [
    { id: 'all', label: 'All Memberships & Products' },
    { id: 'premium_scholar', label: 'Premium Scholar (₹299)' },
    { id: 'book_order', label: 'Book Order (₹499)' }
  ];

  const fetchCouponsList = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    generateRandomCode();
    setIsMembershipSpecific(false);
    setDiscountValue(10);
    setDiscountType('percentage');
    setDiscountMode('Standard');
    setHasUsageCountMax(false);
    setUsageCountMax('');
    setHasUsageLimitPerUser(false);
    setUsageLimitPerUser('');
    setUsageLimitPerUserTimeframe('Lifetime');
    setAllowOnUpgradesDowngrades('No');
    setAllowOnlyIfCustomerAlreadyUsed('Unset');
    setScheduleStartEnabled(false);
    setStartDate('');
    setExpireEnabled(false);
    setExpireDate('');
    setApplicableMemberships(['all']);
    setFormError('');
    setIsModalOpen(true);
  };

  const openBulkModal = () => {
    setIsMembershipSpecific(true);
    setDiscountValue(100);
    setDiscountType('percentage');
    setDiscountMode('Standard');
    setHasUsageCountMax(true);
    setUsageCountMax(1);
    setHasUsageLimitPerUser(true);
    setUsageLimitPerUser(1);
    setUsageLimitPerUserTimeframe('Lifetime');
    setAllowOnUpgradesDowngrades('No');
    setAllowOnlyIfCustomerAlreadyUsed('Unset');
    setScheduleStartEnabled(false);
    setStartDate('');
    setExpireEnabled(false);
    setExpireDate('');
    setApplicableMemberships(['premium_scholar']);
    
    setBulkResult(null);
    setBulkCount(10);
    setIsBulkModalOpen(true);
  };

  const openFreePremiumPreset = () => {
    setEditingCoupon(null);
    generateRandomCode();
    setIsMembershipSpecific(true);
    setDiscountValue(100);
    setDiscountType('percentage');
    setDiscountMode('Standard');
    setHasUsageCountMax(true);
    setUsageCountMax(1);
    setHasUsageLimitPerUser(true);
    setUsageLimitPerUser(1);
    setUsageLimitPerUserTimeframe('Lifetime');
    setAllowOnUpgradesDowngrades('No');
    setAllowOnlyIfCustomerAlreadyUsed('Unset');
    setScheduleStartEnabled(false);
    setStartDate('');
    setExpireEnabled(false);
    setExpireDate('');
    setApplicableMemberships(['premium_scholar']);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setIsMembershipSpecific(coupon.isMembershipSpecific || false);
    setDiscountValue(coupon.discountValue);
    setDiscountType(coupon.discountType || 'percentage');
    setDiscountMode(coupon.discountMode || 'Standard');
    
    if (coupon.usageCountMax !== null && coupon.usageCountMax !== undefined) {
      setHasUsageCountMax(true);
      setUsageCountMax(coupon.usageCountMax);
    } else {
      setHasUsageCountMax(false);
      setUsageCountMax('');
    }

    if (coupon.usageLimitPerUser !== null && coupon.usageLimitPerUser !== undefined) {
      setHasUsageLimitPerUser(true);
      setUsageLimitPerUser(coupon.usageLimitPerUser);
    } else {
      setHasUsageLimitPerUser(false);
      setUsageLimitPerUser('');
    }

    setUsageLimitPerUserTimeframe(coupon.usageLimitPerUserTimeframe || 'Lifetime');
    setAllowOnUpgradesDowngrades(coupon.allowOnUpgradesDowngrades || 'No');
    setAllowOnlyIfCustomerAlreadyUsed(coupon.allowOnlyIfCustomerAlreadyUsed || 'Unset');

    if (coupon.scheduleStartEnabled && coupon.startDate) {
      setScheduleStartEnabled(true);
      setStartDate(new Date(coupon.startDate).toISOString().slice(0, 16));
    } else {
      setScheduleStartEnabled(false);
      setStartDate('');
    }

    if (coupon.expireEnabled && coupon.expireDate) {
      setExpireEnabled(true);
      setExpireDate(new Date(coupon.expireDate).toISOString().slice(0, 16));
    } else {
      setExpireEnabled(false);
      setExpireDate('');
    }

    setApplicableMemberships(coupon.applicableMemberships && coupon.applicableMemberships.length > 0 ? coupon.applicableMemberships : ['all']);
    setFormError('');
    setIsModalOpen(true);
  };

  const handlePlanToggle = (planId) => {
    if (planId === 'all') {
      setApplicableMemberships(['all']);
      return;
    }

    let updated = applicableMemberships.filter(id => id !== 'all');
    if (updated.includes(planId)) {
      updated = updated.filter(id => id !== planId);
    } else {
      updated.push(planId);
    }

    if (updated.length === 0) {
      updated = ['all'];
    }
    setApplicableMemberships(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code.trim()) {
      setFormError('Coupon code is required');
      return;
    }

    if (discountValue <= 0) {
      setFormError('Discount value must be greater than 0');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      isMembershipSpecific,
      discountType,
      discountValue: Number(discountValue),
      discountMode,
      usageCountMax: hasUsageCountMax && usageCountMax !== '' ? Number(usageCountMax) : null,
      usageLimitPerUser: hasUsageLimitPerUser && usageLimitPerUser !== '' ? Number(usageLimitPerUser) : null,
      usageLimitPerUserTimeframe,
      allowOnUpgradesDowngrades,
      allowOnlyIfCustomerAlreadyUsed,
      scheduleStartEnabled,
      startDate: scheduleStartEnabled && startDate ? new Date(startDate) : null,
      expireEnabled,
      expireDate: expireEnabled && expireDate ? new Date(expireDate) : null,
      applicableMemberships
    };

    try {
      setSubmitting(true);
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
      } else {
        await createCoupon(payload);
      }
      setIsModalOpen(false);
      fetchCouponsList();
    } catch (err) {
      setFormError(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleCouponStatus(id);
      fetchCouponsList();
    } catch (err) {
      setError(err.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id, couponCode) => {
    const isConfirmed = await confirm("Delete Coupon", `Are you sure you want to remove coupon "${couponCode}"?`);
    if (isConfirmed) {
      try {
        await deleteCoupon(id);
        fetchCouponsList();
      } catch (err) {
        setError(err.message || 'Failed to delete coupon');
      }
    }
  };

  const now = new Date();

  const getStatus = (c) => {
    if (!c.isActive) return 'inactive';
    if (c.expireEnabled && c.expireDate && new Date(c.expireDate) < now) return 'expired';
    if (c.scheduleStartEnabled && c.startDate && new Date(c.startDate) > now) return 'scheduled';
    if (c.usageCountMax !== null && c.usageCountMax !== undefined && c.usedCount >= c.usageCountMax) return 'used_up';
    return 'live';
  };

  const statusCounts = coupons.reduce((acc, c) => {
    const s = getStatus(c);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.applicableMemberships || []).some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return getStatus(c) === statusFilter;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCoupons.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCoupons.map(c => c._id)));
    }
  };

  const handleBulkCopy = async () => {
    const selectedCodes = coupons
      .filter(c => selectedIds.has(c._id))
      .map(c => c.code);
    if (selectedCodes.length === 0) return;
    try {
      await navigator.clipboard.writeText(selectedCodes.join('\n'));
      setCopySuccess(`${selectedCodes.length} coupon code${selectedCodes.length > 1 ? 's' : ''} copied!`);
      setTimeout(() => setCopySuccess(''), 3000);
    } catch {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const handleBulkGenerate = async () => {
    try {
      setBulkGenerating(true);
      setBulkResult(null);
      const template = {
        isMembershipSpecific,
        discountType,
        discountValue: Number(discountValue),
        discountMode,
        usageCountMax: hasUsageCountMax && usageCountMax !== '' ? Number(usageCountMax) : null,
        usageLimitPerUser: hasUsageLimitPerUser && usageLimitPerUser !== '' ? Number(usageLimitPerUser) : null,
        usageLimitPerUserTimeframe,
        allowOnUpgradesDowngrades,
        allowOnlyIfCustomerAlreadyUsed,
        scheduleStartEnabled,
        startDate: scheduleStartEnabled && startDate ? new Date(startDate) : null,
        expireEnabled,
        expireDate: expireEnabled && expireDate ? new Date(expireDate) : null,
        applicableMemberships,
        isActive: true
      };
      const result = await bulkCreateCoupons(bulkCount, template);
      setBulkResult(result);
      fetchCouponsList();
    } catch (err) {
      setBulkResult({ error: err.message || 'Failed to bulk generate coupons' });
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleCopyBulkResult = async () => {
    if (!bulkResult?.coupons) return;
    const codes = bulkResult.coupons.map(c => c.code).join('\n');
    try {
      await navigator.clipboard.writeText(codes);
      setCopySuccess(`${bulkResult.coupons.length} new codes copied!`);
      setTimeout(() => setCopySuccess(''), 3000);
    } catch {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const renderCouponOptions = (idPrefix = '') => (
    <div className="border border-outline-variant/30 rounded-2xl p-5 bg-surface-container-low/50 space-y-5">
      <h4 className="font-bold text-base text-on-surface border-b border-outline-variant/20 pb-3">
        Coupon Options
      </h4>

      {/* Membership Specific Discounts Checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={`isMembershipSpecific${idPrefix}`}
          checked={isMembershipSpecific}
          onChange={(e) => setIsMembershipSpecific(e.target.checked)}
          className="w-4 h-4 rounded border-outline-variant accent-primary focus:ring-primary"
        />
        <label htmlFor={`isMembershipSpecific${idPrefix}`} className="text-sm font-semibold text-on-surface cursor-pointer">
          Membership Specific Discounts
        </label>
        <IconInfoCircle size={16} className="text-on-surface-variant/70" title="Limit discount to specific memberships" />
      </div>

      {/* Discount Value & Unit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Discount <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="bg-surface border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="percentage">%</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Discount Mode <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <select
            value={discountMode}
            onChange={(e) => setDiscountMode(e.target.value)}
            className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="Standard">Standard</option>
            <option value="First Payment Only">First Payment Only</option>
            <option value="Recurring">Recurring</option>
          </select>
        </div>
      </div>

      {/* Usage Count & Limit per user */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Usage Count (Max total limit) <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="∞ (Unlimited)"
              disabled={!hasUsageCountMax}
              value={usageCountMax}
              onChange={(e) => setUsageCountMax(e.target.value)}
              className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                setHasUsageCountMax(!hasUsageCountMax);
                if (!hasUsageCountMax && !usageCountMax) setUsageCountMax(100);
              }}
              className={`px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1 transition-colors ${
                !hasUsageCountMax 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-surface border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <IconInfinity size={18} /> Unlimited
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Usage Limit Per User <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              placeholder="∞ (Unlimited)"
              disabled={!hasUsageLimitPerUser}
              value={usageLimitPerUser}
              onChange={(e) => setUsageLimitPerUser(e.target.value)}
              className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                setHasUsageLimitPerUser(!hasUsageLimitPerUser);
                if (!hasUsageLimitPerUser && !usageLimitPerUser) setUsageLimitPerUser(1);
              }}
              className={`px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1 transition-colors ${
                !hasUsageLimitPerUser 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : 'bg-surface border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <IconInfinity size={18} /> Unlimited
            </button>
          </div>
        </div>
      </div>

      {/* Dropdowns matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Usage limit per user in Timeframe <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <select
            value={usageLimitPerUserTimeframe}
            onChange={(e) => setUsageLimitPerUserTimeframe(e.target.value)}
            className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="Lifetime">Lifetime</option>
            <option value="1 Day">1 Day</option>
            <option value="1 Week">1 Week</option>
            <option value="1 Month">1 Month</option>
            <option value="1 Year">1 Year</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Allow on Upgrades / Downgrades <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <select
            value={allowOnUpgradesDowngrades}
            onChange={(e) => setAllowOnUpgradesDowngrades(e.target.value)}
            className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
            <option value="Unset">Unset</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1 flex items-center gap-1">
            Allow usage only if customer already used <IconInfoCircle size={14} className="text-on-surface-variant/70" />
          </label>
          <select
            value={allowOnlyIfCustomerAlreadyUsed}
            onChange={(e) => setAllowOnlyIfCustomerAlreadyUsed(e.target.value)}
            className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="Unset">Unset</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Schedule & Expire Checkboxes & Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant/20 pt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id={`scheduleStartEnabled${idPrefix}`}
              checked={scheduleStartEnabled}
              onChange={(e) => setScheduleStartEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant accent-primary"
            />
            <label htmlFor={`scheduleStartEnabled${idPrefix}`} className="text-sm font-semibold text-on-surface cursor-pointer">
              Schedule Coupon Start
            </label>
          </div>
          {scheduleStartEnabled && (
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id={`expireEnabled${idPrefix}`}
              checked={expireEnabled}
              onChange={(e) => setExpireEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant accent-primary"
            />
            <label htmlFor={`expireEnabled${idPrefix}`} className="text-sm font-semibold text-on-surface cursor-pointer">
              Expire Coupon
            </label>
          </div>
          {expireEnabled && (
            <input
              type="datetime-local"
              value={expireDate}
              onChange={(e) => setExpireDate(e.target.value)}
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          )}
        </div>
      </div>

      {/* Membership Applicability Selector */}
      {isMembershipSpecific && (
        <div className="border-t border-outline-variant/20 pt-4">
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
            Apply coupon to the following Memberships / Products: (required)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-surface border border-outline-variant/40 rounded-xl">
            {availablePlans.map((plan) => {
              const selected = applicableMemberships.includes(plan.id);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanToggle(plan.id)}
                  className={`p-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                    selected 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-surface-variant/30 border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/60'
                  }`}
                >
                  <span>{plan.label}</span>
                  {selected && <IconCheck size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <IconTag className="text-primary" size={28} /> Coupon & Discount Manager
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Create, edit, schedule, and manage member discount codes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 self-start md:self-auto">
          <button
            onClick={openBulkModal}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <IconStack2 size={20} /> Bulk Generate
          </button>
          <button
            onClick={openFreePremiumPreset}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <IconTag size={20} /> 100% Free Premium
          </button>
          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <IconPlus size={20} /> Add New Coupon
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* Search Bar & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-variant/30 p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search by code or plan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
        <div className="text-sm text-on-surface-variant font-medium self-end sm:self-center">
          Total Coupons: <span className="font-bold text-on-surface">{coupons.length}</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All', count: coupons.length },
          { id: 'live', label: 'Live', count: statusCounts.live || 0 },
          { id: 'expired', label: 'Expired', count: statusCounts.expired || 0 },
          { id: 'scheduled', label: 'Scheduled', count: statusCounts.scheduled || 0 },
          { id: 'inactive', label: 'Inactive', count: statusCounts.inactive || 0 },
          { id: 'used_up', label: 'Used Up', count: statusCounts.used_up || 0 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? tab.id === 'live' ? 'bg-emerald-500 text-white shadow-sm'
                : tab.id === 'expired' ? 'bg-error text-white shadow-sm'
                : tab.id === 'scheduled' ? 'bg-amber-500 text-white shadow-sm'
                : tab.id === 'inactive' ? 'bg-gray-500 text-white shadow-sm'
                : tab.id === 'used_up' ? 'bg-violet-500 text-white shadow-sm'
                : 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-variant/50 text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {tab.label} <span className="ml-1 opacity-80">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Bulk Selection Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-3 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-bold text-primary">
            {selectedIds.size} coupon{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBulkCopy}
            className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
          >
            <IconCopy size={16} /> Copy Selected Codes
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <IconCheck size={18} /> {copySuccess}
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading coupons...
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="py-12 text-center bg-surface-variant/20 rounded-2xl border border-dashed border-outline-variant/50">
          <IconTag size={40} className="mx-auto text-on-surface-variant/50 mb-3" />
          <p className="font-semibold text-on-surface">No discount codes found</p>
          <p className="text-xs text-on-surface-variant mt-1">Click "Add New Coupon" to create your first discount code.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface shadow-sm">
          <table className="w-full text-left text-sm text-on-surface border-collapse">
            <thead>
              <tr className="bg-surface-variant/50 border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredCoupons.length > 0 && selectedIds.size === filteredCoupons.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Applicable Plans</th>
                <th className="p-4">Schedule / Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredCoupons.map((coupon) => {
                const isExpired = coupon.expireEnabled && coupon.expireDate && new Date(coupon.expireDate) < new Date();
                const isScheduledFuture = coupon.scheduleStartEnabled && coupon.startDate && new Date(coupon.startDate) > new Date();

                return (
                  <tr key={coupon._id} className={`hover:bg-surface-variant/20 transition-colors ${selectedIds.has(coupon._id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(coupon._id)}
                        onChange={() => toggleSelect(coupon._id)}
                        className="w-4 h-4 rounded border-outline-variant accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-primary tracking-wide">
                      {coupon.code}
                    </td>
                    <td className="p-4 font-semibold">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                      <div className="text-xs font-normal text-on-surface-variant">{coupon.discountMode || 'Standard'}</div>
                    </td>
                    <td className="p-4 text-xs font-medium">
                      <span className="font-bold">{coupon.usedCount || 0}</span> / {coupon.usageCountMax !== null ? coupon.usageCountMax : '∞'}
                    </td>
                    <td className="p-4 text-xs">
                      {coupon.isMembershipSpecific ? (
                        <div className="flex flex-wrap gap-1">
                          {(coupon.applicableMemberships || []).map(m => (
                            <span key={m} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md capitalize font-medium">
                              {m.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-md font-medium">
                          All Memberships
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      {isExpired ? (
                        <span className="text-error font-medium flex items-center gap-1">
                          Expired: {new Date(coupon.expireDate).toLocaleDateString()}
                        </span>
                      ) : isScheduledFuture ? (
                        <span className="text-amber-500 font-medium flex items-center gap-1">
                          Starts: {new Date(coupon.startDate).toLocaleDateString()}
                        </span>
                      ) : coupon.expireEnabled && coupon.expireDate ? (
                        <span className="text-on-surface-variant">
                          Expires: {new Date(coupon.expireDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-medium">No Expiration</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(coupon._id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          coupon.isActive 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-error/15 text-error hover:bg-error/25'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-lg transition-colors"
                        title="Edit Coupon"
                      >
                        <IconPencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.code)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete Coupon"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - Add / Edit Coupon (Styled like MemberPress Screenshot) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-outline-variant/30 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-surface-variant/40 px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <IconTag className="text-primary" size={24} />
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}

              {/* Coupon Code Input */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Coupon Code (Title)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. TLIBH3W48V"
                    className="flex-1 bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 font-mono text-lg font-bold text-primary focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-3 bg-surface-variant hover:bg-surface-variant/80 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <IconRefresh size={18} /> Generate Code
                  </button>
                </div>
              </div>

              {/* MemberPress Style Section: Coupon Options */}
              {renderCouponOptions('_single')}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/40 font-bold text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <IconCheck size={18} /> {editingCoupon ? 'Update Coupon' : 'Save Coupon'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-outline-variant/30 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-surface-variant/40 px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <IconStack2 className="text-violet-500" size={24} />
                Bulk Generate 100% Free Coupons
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <p className="text-sm text-on-surface-variant">
                Generate multiple discount coupons at once. Each coupon gets a unique random code. Set the coupon properties below.
              </p>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Number of Coupons to Generate
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-4 py-3 text-lg font-bold text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-on-surface-variant mt-1 mb-4">Max 500 per batch</p>
              </div>

              {renderCouponOptions('_bulk')}

              {/* Bulk Result */}
              {bulkResult && (
                <div className="space-y-3">
                  {bulkResult.error ? (
                    <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-sm font-medium">
                      {bulkResult.error}
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium">
                        ✓ Successfully created {bulkResult.created} coupon{bulkResult.created !== 1 ? 's' : ''}
                        {bulkResult.errors > 0 && ` (${bulkResult.errors} failed)`}
                      </div>
                      {bulkResult.coupons && bulkResult.coupons.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Generated Codes</span>
                            <button
                              onClick={handleCopyBulkResult}
                              className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <IconCopy size={14} /> Copy All Codes
                            </button>
                          </div>
                          <div className="bg-surface-container border border-outline-variant/30 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                            {bulkResult.coupons.map((c) => (
                              <div key={c._id} className="text-primary font-bold tracking-wide">{c.code}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/40 font-bold text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkGenerating}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <IconStack2 size={18} /> Generate {bulkCount} Coupon{bulkCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
