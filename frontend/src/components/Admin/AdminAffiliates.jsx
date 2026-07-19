import React, { useState, useEffect } from 'react';
import { getAdminAffiliates, createAdminAffiliate, updateAdminAffiliate, deleteAdminAffiliate, addAdminAffiliateWalletTransaction, addAdminAffiliateReferral, removeAdminAffiliateReferral } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconEdit, IconTrash, IconReceipt, IconCurrencyRupee, IconWallet, IconUsers, IconUserMinus } from '@tabler/icons-react';
import AdminWithdrawals from './AdminWithdrawals';

export default function AdminAffiliates() {
  const { toast, confirm } = useDialog();
  const [activeTab, setActiveTab] = useState('manage');
  const [affiliates, setAffiliates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [currentAffiliate, setCurrentAffiliate] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', promoCode: '', 
    commissionType: 'percentage', commissionValue: 10
  });
  
  const [walletData, setWalletData] = useState({ amount: '', type: 'manual_addition', notes: '' });
  const [referralData, setReferralData] = useState({ name: '', email: '', plan: 'none', isPaid: true, commissionAmount: 0 });

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
        commissionType: affiliate.commissionType || 'percentage',
        commissionValue: affiliate.commissionValue || 10
      });
    } else {
      setCurrentAffiliate(null);
      setFormData({ 
        name: '', email: '', password: '', 
        promoCode: generatePromoCode(), 
        commissionType: 'percentage', 
        commissionValue: 10 
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenWalletModal = (affiliate) => {
    setCurrentAffiliate(affiliate);
    setWalletData({ amount: '', type: 'manual_addition', notes: '' });
    setIsWalletModalOpen(true);
  };

  const handleOpenReferralModal = (affiliate) => {
    setCurrentAffiliate(affiliate);
    setReferralData({ 
      name: '', 
      email: '', 
      plan: 'none', 
      isPaid: true, 
      commissionAmount: affiliate.commissionType === 'fixed' ? affiliate.commissionValue : 0 
    });
    setIsReferralModalOpen(true);
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

  const handleSaveWalletTransaction = async (e) => {
    e.preventDefault();
    try {
      await addAdminAffiliateWalletTransaction(currentAffiliate._id, {
        amount: Number(walletData.amount),
        type: walletData.type,
        notes: walletData.notes
      });
      toast.success('Wallet transaction recorded successfully');
      fetchAffiliates();
      setIsWalletModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddReferral = async (e) => {
    e.preventDefault();
    try {
      await addAdminAffiliateReferral(currentAffiliate._id, referralData);
      toast.success('Manual referral added successfully');
      fetchAffiliates();
      setIsReferralModalOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteReferral = async (affiliateId, referralId) => {
    if (await confirm("Delete Referral", "Are you sure you want to remove this referral from the affiliate's count?")) {
      try {
        await removeAdminAffiliateReferral(affiliateId, referralId);
        toast.success('Referral removed successfully');
        
        // Update local state for the modal without closing it
        setCurrentAffiliate(prev => ({
          ...prev,
          affiliatedUsers: prev.affiliatedUsers.filter(u => u._id !== referralId)
        }));
        
        fetchAffiliates();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant">Loading affiliates...</div>;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-outline-variant/30 mb-6">
        <button 
          onClick={() => setActiveTab('manage')}
          className={`pb-3 font-semibold text-[15px] border-b-2 transition-colors ${
            activeTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Manage Affiliates
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 font-semibold text-[15px] border-b-2 transition-colors ${
            activeTab === 'withdrawals' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Withdrawal Requests
        </button>
      </div>

      {activeTab === 'manage' && (
        <>
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
              <th className="p-4 font-semibold text-on-surface-variant">Commission</th>
              <th className="p-4 font-semibold text-on-surface-variant">Total Earned</th>
              <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((affiliate) => {
              // Calculate total earned
              let totalEarned = 0;
              if (affiliate.walletTransactions) {
                totalEarned = affiliate.walletTransactions.reduce((acc, curr) => {
                  if (curr.type === 'commission' || curr.type === 'manual_addition') return acc + curr.amount;
                  if (curr.type === 'manual_deduction') return acc - curr.amount;
                  return acc;
                }, 0);
              }

              return (
                <tr key={affiliate._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                  <td className="p-4 font-medium">{affiliate.name}</td>
                  <td className="p-4 text-on-surface-variant">{affiliate.email}</td>
                  <td className="p-4"><code className="bg-surface-container px-2 py-1 rounded">{affiliate.promoCode}</code></td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      {affiliate.commissionType === 'percentage' ? `${affiliate.commissionValue}%` : `₹${affiliate.commissionValue} Fixed`}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-green-600">₹{totalEarned}</td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button aria-label="Manage Referrals" onClick={() => handleOpenReferralModal(affiliate)} className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Manage Referrals">
                      <IconUsers size={18} />
                    </button>
                    <button aria-label="Adjust Wallet" onClick={() => handleOpenWalletModal(affiliate)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Adjust Wallet">
                      <IconWallet size={18} />
                    </button>
                    <button aria-label="Edit Affiliate" onClick={() => handleOpenModal(affiliate)} className="p-2 text-primary hover:bg-primary/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Edit">
                      <IconEdit size={18} />
                    </button>
                    <button aria-label="Delete Affiliate" onClick={() => handleDelete(affiliate._id)} className="p-2 text-error hover:bg-error/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center" title="Delete">
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant">No affiliates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Affiliate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{currentAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type={currentAffiliate ? "password" : "text"} placeholder={currentAffiliate ? "New Password (Optional)" : "Password"} required={!currentAffiliate} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" />
              <input type="text" placeholder="Promo Code (e.g. SAVE20)" required value={formData.promoCode} onChange={e => setFormData({...formData, promoCode: e.target.value})} className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface uppercase" />
              
              <div className="flex flex-col gap-2 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
                <span className="font-semibold text-sm text-on-surface">Commission Settings</span>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="commissionType" 
                      value="percentage" 
                      checked={formData.commissionType === 'percentage'}
                      onChange={e => setFormData({...formData, commissionType: e.target.value})}
                      className="text-primary focus:ring-primary"
                    />
                    Percentage
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="commissionType" 
                      value="fixed" 
                      checked={formData.commissionType === 'fixed'}
                      onChange={e => setFormData({...formData, commissionType: e.target.value})}
                      className="text-primary focus:ring-primary"
                    />
                    Fixed Amount
                  </label>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs font-medium text-on-surface-variant">
                    {formData.commissionType === 'percentage' ? 'Commission Percentage (%)' : 'Fixed Commission (₹)'}
                  </label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    max={formData.commissionType === 'percentage' ? 100 : undefined} 
                    value={formData.commissionValue} 
                    onChange={e => setFormData({...formData, commissionValue: Number(e.target.value)})} 
                    className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" 
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Wallet Transaction Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><IconWallet /> Adjust Wallet</h3>
            <p className="text-sm text-on-surface-variant mb-4">Add or deduct funds for {currentAffiliate?.name}.</p>
            <form onSubmit={handleSaveWalletTransaction} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Transaction Type</label>
                <select 
                  value={walletData.type}
                  onChange={e => setWalletData({...walletData, type: e.target.value})}
                  className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface"
                >
                  <option value="manual_addition">Add Funds (+)</option>
                  <option value="manual_deduction">Deduct Funds (-)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="Amount (₹)" 
                  required 
                  min="1" 
                  value={walletData.amount} 
                  onChange={e => setWalletData({...walletData, amount: e.target.value})} 
                  className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Notes</label>
                <textarea 
                  placeholder="Reason for adjustment..." 
                  required 
                  value={walletData.notes} 
                  onChange={e => setWalletData({...walletData, notes: e.target.value})} 
                  className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface min-h-[80px]"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setIsWalletModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Record Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Referrals Modal */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><IconUsers /> Manage Referrals</h3>
              <button onClick={() => setIsReferralModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">Close</button>
            </div>
            
            <p className="text-sm text-on-surface-variant mb-6">Viewing referrals for <strong>{currentAffiliate?.name}</strong>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add Manual Referral Form */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-[var(--border-floating-card)] h-fit">
                <h4 className="font-bold text-sm mb-4">Add Manual Referral</h4>
                <form onSubmit={handleAddReferral} className="flex flex-col gap-3">
                  <input type="text" placeholder="Name" required value={referralData.name} onChange={e => setReferralData({...referralData, name: e.target.value})} className="px-3 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-sm text-on-surface" />
                  <input type="email" placeholder="Email" required value={referralData.email} onChange={e => setReferralData({...referralData, email: e.target.value})} className="px-3 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-sm text-on-surface" />
                  <select value={referralData.plan} onChange={e => setReferralData({...referralData, plan: e.target.value})} className="px-3 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-sm text-on-surface">
                    <option value="none">No Plan (Free Registration)</option>
                    <option value="scale_plan">Scale Plan</option>
                    <option value="premium_scholar">Premium Scholar</option>
                  </select>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-sm mt-1 text-on-surface">
                    <input 
                      type="checkbox" 
                      checked={referralData.isPaid}
                      onChange={e => setReferralData({...referralData, isPaid: e.target.checked})}
                      className="text-primary focus:ring-primary rounded"
                    />
                    Already paid for this referral
                  </label>

                  {!referralData.isPaid && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-on-surface-variant">
                        Commission to add to wallet (₹)
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        required={!referralData.isPaid}
                        value={referralData.commissionAmount} 
                        onChange={e => setReferralData({...referralData, commissionAmount: Number(e.target.value)})} 
                        className="px-3 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-sm text-on-surface" 
                      />
                    </div>
                  )}

                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm mt-2 transition-colors">Add Referral</button>
                </form>
              </div>

              {/* Referrals List */}
              <div className="max-h-[350px] overflow-y-auto pr-2">
                <h4 className="font-bold text-sm mb-4">Current Referrals ({currentAffiliate?.affiliatedUsers?.length || 0})</h4>
                {currentAffiliate?.affiliatedUsers?.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No referrals found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentAffiliate?.affiliatedUsers?.map(ref => {
                      const name = ref.userId?.name || ref.manualName || 'Unknown';
                      const email = ref.userId?.email || ref.manualEmail || 'No email';
                      const isManual = !ref.userId;
                      
                      return (
                        <div key={ref._id} className="p-3 bg-surface-container border border-outline-variant/30 rounded-lg flex items-center justify-between">
                          <div className="overflow-hidden">
                            <p className="font-semibold text-sm truncate">{name} {isManual && <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded ml-1 font-bold">MANUAL</span>}</p>
                            <p className="text-xs text-on-surface-variant truncate">{email}</p>
                            <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">{ref.plan === 'none' ? 'Registered' : ref.plan.replace('_', ' ')}</p>
                          </div>
                          <button aria-label="Remove Referral" onClick={() => handleDeleteReferral(currentAffiliate._id, ref._id)} className="p-1.5 text-error hover:bg-error/10 rounded-lg flex-shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Remove Referral">
                            <IconUserMinus size={16} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      </>
      )}

      {activeTab === 'withdrawals' && (
        <AdminWithdrawals />
      )}
    </div>
  );
}
