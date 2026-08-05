import React, { useState, useEffect } from 'react';
import { IconPlus, IconEdit, IconTrash, IconX, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import api from '../../services/api';

const INDIVIDUAL_IDS = [
  { value: 'free', label: 'free (Default Free Plan)' },
  { value: 'premium', label: 'premium (Standard Premium)' },
  { value: 'premium_scholar', label: 'premium_scholar (Top Tier Premium)' },
  { value: 'custom_ind_1', label: 'custom_ind_1 (Extra Option 1)' },
  { value: 'custom_ind_2', label: 'custom_ind_2 (Extra Option 2)' }
];

const INSTITUTIONAL_IDS = [
  { value: 'inst_basic', label: 'inst_basic (Small Batch)' },
  { value: 'inst_pro', label: 'inst_pro (Medium Batch)' },
  { value: 'inst_premium', label: 'inst_premium (Large Batch)' },
  { value: 'inst_custom', label: 'inst_custom (Contact for Custom)' }
];

export default function ManagePricingPlans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    category: 'individual',
    planId: 'premium',
    name: '',
    badge: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    originalPrice: 0,
    yearlyBillingTotal: 0,
    originalYearlyBillingTotal: 0,
    perUserPriceYearly: 0,
    originalPerUserPrice: 0,
    seatCount: 0,
    subtextLine1: '',
    subtextLine2: '',
    description: '',
    buttonText: '',
    buttonVariant: 'secondary',
    features: [''],
    customPrice: false,
    priceLabel: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/pricing-plans/admin');
      setPlans(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load pricing plans');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      planId: newCategory === 'individual' ? 'premium' : 'inst_basic'
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const openModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        ...plan,
        badge: plan.badge || '',
        subtextLine1: plan.subtextLine1 || '',
        subtextLine2: plan.subtextLine2 || '',
        description: plan.description || '',
        priceLabel: plan.priceLabel || ''
      });
    } else {
      setEditingPlan(null);
      setFormData({
        category: 'individual',
        planId: 'premium',
        name: '',
        badge: '',
        monthlyPrice: 0,
        yearlyPrice: 0,
        originalPrice: 0,
        yearlyBillingTotal: 0,
        originalYearlyBillingTotal: 0,
        perUserPriceYearly: 0,
        originalPerUserPrice: 0,
        seatCount: 0,
        subtextLine1: '',
        subtextLine2: '',
        description: '',
        buttonText: '',
        buttonVariant: 'secondary',
        features: [''],
        customPrice: false,
        priceLabel: '',
        order: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Client-side validation for category limit
      if (!editingPlan || editingPlan.category !== formData.category) {
        const categoryCount = plans.filter(p => p.category === formData.category).length;
        if (categoryCount >= 3) {
          alert(`Maximum 3 plans allowed for the ${formData.category} category. Please delete an existing plan first.`);
          return;
        }
      }

      // Check for duplicate planId in the same category (only when creating)
      if (!editingPlan) {
        const isDuplicateId = plans.some(p => p.planId === formData.planId && p.category === formData.category);
        if (isDuplicateId) {
          alert(`The Plan ID '${formData.planId}' is already being used. Please choose a different one or edit the existing plan.`);
          return;
        }
      }

      // Filter out empty features
      const payload = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        await api.put(`/api/pricing-plans/${editingPlan._id}`, payload);
      } else {
        await api.post('/api/pricing-plans', payload);
      }
      fetchPlans();
      closeModal();
    } catch (err) {
      console.error('Error saving plan:', err);
      alert(err.response?.data?.message || 'Error saving plan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pricing plan?')) {
      try {
        await api.delete(`/api/pricing-plans/${id}`);
        fetchPlans();
      } catch (err) {
        console.error('Error deleting plan:', err);
        alert('Error deleting plan');
      }
    }
  };

  const renderPlanTable = (category) => {
    const categoryPlans = plans.filter(p => p.category === category);
    
    return (
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 capitalize">{category} Plans ({categoryPlans.length}/3)</h3>
        <div className="overflow-x-auto bg-surface rounded-xl border border-outline-variant/30 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-surface-container/50 border-b border-outline-variant/30">
              <tr>
                <th className="p-4 font-semibold text-sm">Order</th>
                <th className="p-4 font-semibold text-sm">Name (ID)</th>
                <th className="p-4 font-semibold text-sm">Price</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {categoryPlans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">No plans found.</td>
                </tr>
              ) : (
                categoryPlans.map(plan => (
                  <tr key={plan._id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="p-4">{plan.order}</td>
                    <td className="p-4">
                      <div className="font-bold text-sm">{plan.name}</div>
                      <div className="text-[11px] text-on-surface-variant/80 mt-0.5">ID: {plan.planId}</div>
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {plan.customPrice ? (
                        <span className="italic text-on-surface-variant">{plan.priceLabel || 'Custom'}</span>
                      ) : (
                        `₹${plan.yearlyPrice || plan.monthlyPrice}`
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${plan.isActive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
                        {plan.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openModal(plan)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <IconEdit size={18} />
                        </button>
                        <button onClick={() => handleDelete(plan._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center flex flex-col items-center gap-4"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>Loading Plans...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Manage Pricing Plans</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Configure up to 3 individual and 3 institutional pricing cards.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <IconPlus size={20} /> Add New Plan
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-rose-500/10 text-rose-500 rounded-xl font-medium">{error}</div>}

      {renderPlanTable('individual')}
      {renderPlanTable('institutional')}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="bg-surface w-full max-w-5xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-surface/95 backdrop-blur-md z-20 flex justify-between items-center p-6 md:px-8 border-b border-outline-variant/30 shadow-sm">
              <div>
                <h3 className="text-xl font-black text-on-surface tracking-tight">{editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}</h3>
                <p className="text-sm text-on-surface-variant mt-1 font-medium">Configure how this plan appears on the pricing page.</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                <IconX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              
              {/* Section 1: Identity & Categorization */}
              <div className="mb-10 bg-surface-container/20 p-5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-black text-xs">1</span>
                  <h4 className="font-extrabold text-lg tracking-tight">Identity & Categorization</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Target Audience (Category)</label>
                    <select name="category" value={formData.category} onChange={handleCategoryChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium text-sm" required disabled={editingPlan != null}>
                      <option value="individual">For Students (Individual)</option>
                      <option value="institutional">For Institutes (Batch)</option>
                    </select>
                    <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1"><IconInfoCircle size={14} className="text-primary/70"/> Determines which tab this plan appears under.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Internal Plan ID</label>
                    <select name="planId" value={formData.planId} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium text-sm" required disabled={editingPlan != null}>
                      {formData.category === 'individual' ? INDIVIDUAL_IDS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      )) : INSTITUTIONAL_IDS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1"><IconInfoCircle size={14} className="text-primary/70"/> Links this card to backend logic (e.g. Free or Premium capabilities).</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Display Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm font-medium" required placeholder="e.g. Premium Scholar" />
                    <p className="text-xs text-on-surface-variant mt-1.5">The main title shown at the top of the card.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5">Display Order</label>
                    <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm font-medium" />
                    <p className="text-xs text-on-surface-variant mt-1.5">1 shows up first, 2 shows up second, etc.</p>
                  </div>

                  <div className="md:col-span-2 bg-surface p-5 rounded-2xl border border-outline-variant/50 flex items-center shadow-sm">
                    <label className="flex items-center gap-4 cursor-pointer w-full">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-primary" />
                      <div>
                        <span className="text-sm font-extrabold block">Active Status (Visible to users)</span>
                        <span className="text-xs text-on-surface-variant mt-0.5 block">Turn this off to hide the plan from the website without deleting it.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing Configuration */}
              <div className="mb-10 bg-surface-container/20 p-5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-black text-xs">2</span>
                    <h4 className="font-extrabold text-lg tracking-tight">Pricing Configuration</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-primary/10 px-4 py-2 rounded-full border border-primary/20 transition-colors hover:bg-primary/20">
                    <input type="checkbox" name="customPrice" checked={formData.customPrice} onChange={handleInputChange} className="w-4 h-4 text-primary bg-surface border-outline-variant rounded" />
                    <span className="text-sm font-extrabold text-primary">Use Custom Pricing</span>
                  </label>
                </div>

                {formData.customPrice ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl shadow-inner">
                    <label className="block text-sm font-extrabold mb-2 text-blue-700 dark:text-blue-300">Custom Price Text</label>
                    <input type="text" name="priceLabel" value={formData.priceLabel} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-blue-500/30 bg-surface focus:border-blue-500 focus:outline-none transition-all text-sm font-medium" placeholder="e.g. Contact Us for Pricing" />
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2 font-medium">This text will replace the standard price numbers (₹).</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">Final Monthly Price (₹)</label>
                      <input type="number" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">Final Yearly Price (₹)</label>
                      <input type="number" name="yearlyPrice" value={formData.yearlyPrice} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" />
                      <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1 font-medium"><IconInfoCircle size={12}/> The main large price shown.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5 text-rose-500">Crossed-out Price (₹)</label>
                      <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" />
                      <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">Creates a strike-through effect for discounts.</p>
                    </div>
                    
                    {formData.category === 'institutional' && (
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 bg-surface p-5 rounded-2xl border border-outline-variant/30 shadow-sm">
                        <div>
                          <label className="block text-sm font-bold mb-1.5 text-indigo-600 dark:text-indigo-400">Seat Count (Users)</label>
                          <input type="number" name="seatCount" value={formData.seatCount} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" placeholder="e.g. 20" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-1.5 text-indigo-600 dark:text-indigo-400">Yearly Billing Total (₹)</label>
                          <input type="number" name="yearlyBillingTotal" value={formData.yearlyBillingTotal} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" />
                          <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">Total amount charged to the institute per year.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Marketing Copy & Buttons */}
              <div className="mb-10 bg-surface-container/20 p-5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-black text-xs">3</span>
                  <h4 className="font-extrabold text-lg tracking-tight">Marketing Text & Action Button</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-amber-600 dark:text-amber-500">Highlight Badge (Optional)</label>
                    <input type="text" name="badge" value={formData.badge} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-amber-500 focus:outline-none transition-all text-sm font-medium" placeholder="e.g. Most Popular, Recommended" />
                    <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">Adds a ribbon to the top right of the card.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Main Description Paragraph</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" rows="2" placeholder="Explain who this plan is best for..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-emerald-600 dark:text-emerald-400">Green Subtext (Line 1)</label>
                    <input type="text" name="subtextLine1" value={formData.subtextLine1} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" placeholder="e.g. Save 50% on yearly billing" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Faded Subtext (Line 2)</label>
                    <input type="text" name="subtextLine2" value={formData.subtextLine2} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" placeholder="e.g. Cancel anytime" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-5 rounded-2xl border border-outline-variant/50 shadow-sm">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Button Text*</label>
                    <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium" required placeholder="e.g. Get Started" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Button Style</label>
                    <select name="buttonVariant" value={formData.buttonVariant} onChange={handleInputChange} className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium">
                      <option value="primary">Primary (Solid Color)</option>
                      <option value="secondary">Secondary (Outlined)</option>
                    </select>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">Use Primary to make the button stand out.</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Features List */}
              <div className="mb-4 bg-surface-container/20 p-5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-black text-xs">4</span>
                  <h4 className="font-extrabold text-lg tracking-tight">What's Included (Feature List)</h4>
                </div>
                
                <p className="text-[13px] text-on-surface-variant mb-5 font-medium">Add bullet points that will appear with a green checkmark at the bottom of the card.</p>

                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 group">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 p-3.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm font-medium"
                        placeholder={`Feature ${index + 1}... (e.g. Unrestricted access to all songs)`}
                      />
                      <button type="button" onClick={() => removeFeature(index)} className="p-3.5 text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 flex items-center justify-center border border-transparent">
                        <IconTrash size={20} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addFeature} className="mt-4 px-5 py-2.5 text-primary font-extrabold text-sm flex items-center gap-2 hover:bg-primary/10 rounded-xl transition-colors border border-primary/20 w-fit">
                    <IconPlus size={18} /> Add Another Feature
                  </button>
                </div>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:px-8 border-t border-outline-variant/30 flex justify-end gap-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] z-30">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold border border-outline-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 rounded-xl font-extrabold bg-primary text-on-primary hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 shadow-lg shadow-primary/20">
                  <IconCheck size={20} /> {editingPlan ? 'Save Changes' : 'Create Pricing Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
