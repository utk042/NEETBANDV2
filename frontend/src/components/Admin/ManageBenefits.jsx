import React, { useState, useEffect, useRef } from 'react';
import { 
  getAdminBenefits, 
  createBenefit, 
  updateBenefit, 
  deleteBenefit, 
  toggleBenefitAvailability 
} from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { 
  IconGift, 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconSearch, 
  IconCheck, 
  IconX, 
  IconExternalLink,
  IconSparkles,
  IconTag,
  IconClock,
  IconChevronDown
} from '@tabler/icons-react';

function CustomSelect({ options, value, onChange, placeholder = "Select option" }) {
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

  const selectedOption = options.find(opt => opt.value === value) || { label: value || placeholder, value };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm flex items-center justify-between focus:ring-2 focus:ring-primary/50 focus:outline-none transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedOption.label || value}</span>
        <IconChevronDown size={18} className={`text-on-surface-variant transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 py-1.5 bg-[#121929] border border-outline-variant/60 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto scrollbar-thin">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected 
                    ? 'text-primary font-bold bg-primary/20' 
                    : 'text-on-surface hover:bg-surface-variant/50 hover:text-primary'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IconCheck size={16} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ManageBenefits() {
  const { alert: dialogAlert, confirm: dialogConfirm } = useDialog();
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    category: 'Health',
    offerType: 'Discount',
    timing: 'Ongoing',
    description: '',
    memberValue: '',
    imageUrl: '',
    code: '',
    link: '',
    badgeText: 'Member-exclusive',
    isFeatured: false,
    isAvailable: true,
    order: 0,
  });

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const data = await getAdminBenefits();
      setBenefits(data || []);
    } catch (err) {
      console.error('Failed to load benefits:', err);
      dialogAlert('Error', 'Failed to fetch member benefits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBenefit(null);
    setFormData({
      title: '',
      provider: '',
      category: 'Health',
      offerType: 'Discount',
      timing: 'Ongoing',
      description: '',
      memberValue: 'Free',
      imageUrl: '',
      code: '',
      link: '',
      badgeText: 'Member-exclusive',
      isFeatured: false,
      isAvailable: true,
      order: benefits.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      title: benefit.title || '',
      provider: benefit.provider || '',
      category: benefit.category || 'Health',
      offerType: benefit.offerType || 'Discount',
      timing: benefit.timing || 'Ongoing',
      description: benefit.description || '',
      memberValue: benefit.memberValue || '',
      imageUrl: benefit.imageUrl || '',
      code: benefit.code || '',
      link: benefit.link || '',
      badgeText: benefit.badgeText || 'Member-exclusive',
      isFeatured: benefit.isFeatured || false,
      isAvailable: benefit.isAvailable !== undefined ? benefit.isAvailable : true,
      order: benefit.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.provider || !formData.description) {
      dialogAlert('Validation Error', 'Title, Provider, and Description are required.');
      return;
    }

    try {
      if (editingBenefit) {
        await updateBenefit(editingBenefit._id, formData);
        dialogAlert('Success', 'Benefit updated successfully!');
      } else {
        await createBenefit(formData);
        dialogAlert('Success', 'New benefit created successfully!');
      }
      setIsModalOpen(false);
      fetchBenefits();
    } catch (err) {
      console.error('Failed to save benefit:', err);
      dialogAlert('Error', err.message || 'Failed to save benefit.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBenefitAvailability(id);
      setBenefits(prev => prev.map(b => b._id === id ? { ...b, isAvailable: !b.isAvailable } : b));
    } catch (err) {
      console.error('Failed to toggle status:', err);
      dialogAlert('Error', 'Failed to update availability status.');
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = await dialogConfirm(
      'Delete Benefit',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );
    if (isConfirmed) {
      try {
        await deleteBenefit(id);
        setBenefits(prev => prev.filter(b => b._id !== id));
        dialogAlert('Deleted', 'Benefit removed successfully.');
      } catch (err) {
        console.error('Failed to delete benefit:', err);
        dialogAlert('Error', 'Failed to delete benefit.');
      }
    }
  };

  const filteredBenefits = benefits.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch = 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <IconGift className="text-primary" size={28} /> Manage Member Benefits
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Add, edit, and organize partner offers, discounts, and perks for members.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors text-sm"
        >
          <IconPlus size={18} /> Add New Benefit
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-variant/30 p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            type="text"
            placeholder="Search benefits or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/50 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Health', 'Learning', 'Lifestyle'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface border border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {cat} {cat === 'All' ? `(${benefits.length})` : `(${benefits.filter(b => b.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Loading member benefits...</p>
        </div>
      ) : filteredBenefits.length === 0 ? (
        <div className="py-16 text-center bg-surface-variant/20 rounded-2xl border border-dashed border-outline-variant/50">
          <IconGift size={48} className="mx-auto text-on-surface-variant/40 mb-3" />
          <h3 className="font-bold text-on-surface text-base mb-1">No benefits found</h3>
          <p className="text-on-surface-variant text-sm mb-4">Try adjusting your search or add a new benefit offer.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-colors"
          >
            + Create First Benefit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenefits.map((benefit) => (
            <div
              key={benefit._id}
              className={`bg-surface rounded-2xl border ${
                benefit.isAvailable ? 'border-outline-variant/40' : 'border-error/30 opacity-70'
              } shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden relative group`}
            >
              {/* Image & Header Overlay */}
              <div className="h-44 bg-surface-variant relative overflow-hidden">
                {benefit.imageUrl ? (
                  <img
                    src={benefit.imageUrl}
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                    <IconGift size={48} />
                  </div>
                )}
                
                {/* Floating Category Pill */}
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-outline-variant/30 flex items-center gap-1">
                  <IconSparkles size={14} /> {benefit.category}
                </div>

                {/* Status Switch Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(benefit._id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${
                      benefit.isAvailable
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                        : 'bg-error/90 text-white hover:bg-error'
                    }`}
                    title="Click to toggle availability"
                  >
                    {benefit.isAvailable ? <IconCheck size={14} /> : <IconX size={14} />}
                    {benefit.isAvailable ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      <IconTag size={12} /> {benefit.offerType}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <IconClock size={12} /> {benefit.timing}
                    </span>
                  </div>

                  <h3 className="font-bold text-on-surface text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mb-3">
                    by <span className="text-on-surface font-semibold">{benefit.provider}</span>
                  </p>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
                    {benefit.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Benefit Value</div>
                    <div className="text-sm font-extrabold text-primary">{benefit.memberValue}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(benefit)}
                      className="p-2 rounded-xl bg-surface-variant hover:bg-primary/10 hover:text-primary text-on-surface transition-colors"
                      title="Edit Benefit"
                    >
                      <IconPencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(benefit._id, benefit.title)}
                      className="p-2 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                      title="Delete Benefit"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-outline-variant/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <IconGift className="text-primary" size={24} />
                {editingBenefit ? 'Edit Member Benefit' : 'Add New Member Benefit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biannual Comprehensive Eye Check-up"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Provider / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eye Hospitals Network"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                  <CustomSelect
                    options={[
                      { label: 'Health', value: 'Health' },
                      { label: 'Learning', value: 'Learning' },
                      { label: 'Lifestyle', value: 'Lifestyle' }
                    ]}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Offer Type Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Free Service, Discount"
                    value={formData.offerType}
                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Timing Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Biannual, Ongoing"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Benefit Value Display</label>
                  <CustomSelect
                    options={[
                      { label: 'Free', value: 'Free' },
                      { label: '10% off', value: '10% off' },
                      { label: '20% off', value: '20% off' },
                      { label: '25% off', value: '25% off' },
                      { label: '30% off', value: '30% off' },
                      { label: '40% off', value: '40% off' },
                      { label: '50% off', value: '50% off' },
                      { label: 'Buy 1 Get 1', value: 'Buy 1 Get 1' },
                      { label: 'Full Access', value: 'Full Access' },
                      { label: 'Special Offer', value: 'Special Offer' },
                      { label: 'Custom...', value: 'Custom' }
                    ]}
                    value={
                      ['Free', '10% off', '20% off', '25% off', '30% off', '40% off', '50% off', 'Buy 1 Get 1', 'Full Access', 'Special Offer'].includes(formData.memberValue)
                        ? formData.memberValue
                        : (formData.memberValue ? 'Custom' : 'Free')
                    }
                    onChange={(val) => {
                      if (val === 'Custom') {
                        const isPreset = ['Free', '10% off', '20% off', '25% off', '30% off', '40% off', '50% off', 'Buy 1 Get 1', 'Full Access', 'Special Offer'].includes(formData.memberValue);
                        setFormData({ ...formData, memberValue: isPreset ? 'Custom Offer' : formData.memberValue });
                      } else {
                        setFormData({ ...formData, memberValue: val });
                      }
                    }}
                  />

                  {!['Free', '10% off', '20% off', '25% off', '30% off', '40% off', '50% off', 'Buy 1 Get 1', 'Full Access', 'Special Offer'].includes(formData.memberValue) && (
                    <input
                      type="text"
                      placeholder="Enter custom value (e.g. ₹1,500 Saved)"
                      value={formData.memberValue}
                      onChange={(e) => setFormData({ ...formData, memberValue: e.target.value })}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Promo Code (if any)</label>
                  <input
                    type="text"
                    placeholder="e.g. EYEFREE2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm font-mono focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Redirect Link / Route *</label>
                  <input
                    type="text"
                    placeholder="e.g. /offers/eye-checkup or https://..."
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of the offer for students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-variant/30 border border-outline-variant/50 text-on-surface text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  Active & Available
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  Featured Badge
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-surface-variant text-on-surface font-bold text-sm hover:bg-surface-variant/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors"
                >
                  {editingBenefit ? 'Save Changes' : 'Create Benefit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
