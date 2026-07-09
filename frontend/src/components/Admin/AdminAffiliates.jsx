import React, { useState, useEffect } from 'react';
import { getAdminAffiliates, createAdminAffiliate, updateAdminAffiliate, deleteAdminAffiliate, addAdminAffiliateSettlement } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconEdit, IconTrash, IconReceipt, IconCurrencyRupee } from '@tabler/icons-react';

export default function AdminAffiliates() {
  const { toast, confirm } = useDialog();
  const [affiliates, setAffiliates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [currentAffiliate, setCurrentAffiliate] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', promoCode: '', 
    discountEnabled: false, discountValue: 10, earnings: 0 
  });
  const [settlementData, setSettlementData] = useState({ amount: '', notes: '' });

  const generatePromoCode = () => {
    return 'NB' + Math.floor(10000 + Math.random() * 90000);
  };

  const fetchAffiliates = async () => {
    try {
      const data = await getAdminAffiliates();
      setAffiliates(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch affiliates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleOpenModal = (affiliate = null) => {
    if (affiliate) {
      setCurrentAffiliate(affiliate);
      setFormData({ 
        name: affiliate.name, 
        email: affiliate.email, 
        password: '', 
        promoCode: affiliate.promoCode,
        discountEnabled: affiliate.discountEnabled || false,
        discountValue: affiliate.discountValue || 10,
        earnings: affiliate.earnings || 0
      });
    } else {
      setCurrentAffiliate(null);
      setFormData({ name: '', email: '', password: '', promoCode: generatePromoCode(), discountEnabled: false, discountValue: 10, earnings: 0 });
    }
    setIsModalOpen(true);
  };

  const handleOpenSettlementModal = (affiliate) => {
    setCurrentAffiliate(affiliate);
    setSettlementData({ amount: '', notes: '' });
    setIsSettlementModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentAffiliate) {
        await updateAdminAffiliate(currentAffiliate._id, formData);
        toast.success('Affiliate updated successfully');
      } else {
        await createAdminAffiliate(formData);
        toast.success('Affiliate created successfully');
      }
      fetchAffiliates();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (await confirm("Delete Affiliate", "Are you sure you want to delete this affiliate?")) {
      try {
        await deleteAdminAffiliate(id);
        toast.success('Affiliate deleted successfully');
        fetchAffiliates();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleSaveSettlement = async (e) => {
    e.preventDefault();
    try {
      await addAdminAffiliateSettlement(currentAffiliate._id, {
        amount: Number(settlementData.amount),
        notes: settlementData.notes
      });
      toast.success('Settlement recorded successfully');
      fetchAffiliates();
      setIsSettlementModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant">Loading affiliates...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Manage Affiliates</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <IconPlus size={20} /> Add Affiliate
        </button>
      </div>

      <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-floating-card)]">
              <th className="p-4 font-semibold text-on-surface-variant">Name</th>
              <th className="p-4 font-semibold text-on-surface-variant">Email</th>
              <th className="p-4 font-semibold text-on-surface-variant">Promo Code</th>
              <th className="p-4 font-semibold text-on-surface-variant">Discount Active</th>
              <th className="p-4 font-semibold text-on-surface-variant">Earnings</th>
              <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((affiliate) => (
              <tr key={affiliate._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                <td className="p-4 font-medium">{affiliate.name}</td>
                <td className="p-4 text-on-surface-variant">{affiliate.email}</td>
                <td className="p-4"><code className="bg-surface-container px-2 py-1 rounded">{affiliate.promoCode}</code></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${affiliate.discountEnabled ? 'bg-green-500/10 text-green-600' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {affiliate.discountEnabled ? `${affiliate.discountValue || 10}% Active` : 'No'}
                  </span>
                </td>
                <td className="p-4 font-bold text-green-600">₹{affiliate.earnings}</td>
                <td className="p-4 flex items-center justify-end gap-2">
                  <button onClick={() => handleOpenSettlementModal(affiliate)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg" title="Add Settlement">
                    <IconReceipt size={18} />
                  </button>
                  <button onClick={() => handleOpenModal(affiliate)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                    <IconEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(affiliate._id)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                    <IconTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant">No affiliates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30">
            <h3 className="text-xl font-bold mb-4">{currentAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type={currentAffiliate ? "password" : "text"} placeholder={currentAffiliate ? "New Password (Optional)" : "Password"} required={!currentAffiliate} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type="text" placeholder="Promo Code (e.g. SAVE20)" required value={formData.promoCode} onChange={e => setFormData({...formData, promoCode: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface uppercase" />
              
              {currentAffiliate && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-on-surface-variant">Manual Earnings (₹)</label>
                  <input type="number" placeholder="Earnings" required value={formData.earnings} onChange={e => setFormData({...formData, earnings: Number(e.target.value)})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
                </div>
              )}

              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-surface-container-low border border-[var(--border-floating-card)] hover:bg-surface-container/50 transition-colors">
                <span className="text-on-surface text-sm font-semibold">Enable Promo Discount</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={formData.discountEnabled} 
                    onChange={e => setFormData({...formData, discountEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </label>

              {formData.discountEnabled && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-on-surface-variant">Discount Percentage (%)</label>
                  <input type="number" placeholder="e.g. 10" required min="1" max="100" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
                </div>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSettlementModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><IconReceipt /> Add Settlement</h3>
            <p className="text-sm text-on-surface-variant mb-4">Record a payment made to {currentAffiliate?.name}.</p>
            <form onSubmit={handleSaveSettlement} className="flex flex-col gap-4">
              <input type="number" placeholder="Amount (₹)" required min="1" value={settlementData.amount} onChange={e => setSettlementData({...settlementData, amount: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <textarea placeholder="Notes (e.g. Bank Transfer Ref: XYZ)" required value={settlementData.notes} onChange={e => setSettlementData({...settlementData, notes: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface min-h-[100px]"></textarea>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setIsSettlementModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
