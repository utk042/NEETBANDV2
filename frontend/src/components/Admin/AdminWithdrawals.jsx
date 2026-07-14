import React, { useState, useEffect } from 'react';
import { getAdminWithdrawals, processAdminWithdrawal } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconCheck, IconX, IconReceipt } from '@tabler/icons-react';

export default function AdminWithdrawals() {
  const { toast, confirm } = useDialog();
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentWithdrawal, setCurrentWithdrawal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const data = await getAdminWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch withdrawals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id) => {
    if (await confirm("Approve Withdrawal", "Are you sure you have manually transferred the amount? This action cannot be undone.")) {
      try {
        setIsProcessing(true);
        await processAdminWithdrawal(id, { status: 'completed' });
        toast.success("Withdrawal approved successfully");
        fetchWithdrawals();
      } catch (err) {
        toast.error(err.message || "Failed to approve withdrawal");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const openRejectModal = (withdrawal) => {
    setCurrentWithdrawal(withdrawal);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      return toast.error("Reject reason is required");
    }
    
    try {
      setIsProcessing(true);
      await processAdminWithdrawal(currentWithdrawal._id, { 
        status: 'rejected', 
        rejectReason 
      });
      toast.success("Withdrawal rejected successfully");
      setIsRejectModalOpen(false);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.message || "Failed to reject withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant">Loading withdrawals...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Withdrawal Requests</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage payout requests from affiliates.</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-floating-card)] bg-surface-variant/30">
              <th className="p-4 font-semibold text-on-surface-variant">Date</th>
              <th className="p-4 font-semibold text-on-surface-variant">Affiliate</th>
              <th className="p-4 font-semibold text-on-surface-variant">Amount</th>
              <th className="p-4 font-semibold text-on-surface-variant">Payment Details</th>
              <th className="p-4 font-semibold text-on-surface-variant">Status</th>
              <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => (
              <tr key={item._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                <td className="p-4 text-on-surface-variant text-sm whitespace-nowrap">
                  {new Date(item.requestedAt).toLocaleDateString()}
                </td>
                <td className="p-4 font-medium text-on-surface">
                  {item.affiliateId?.name || 'Unknown'}
                  <div className="text-xs text-on-surface-variant">{item.affiliateId?.email || 'N/A'}</div>
                </td>
                <td className="p-4 font-bold text-emerald-600">₹{item.amount}</td>
                <td className="p-4">
                  <div className="text-sm font-semibold">{item.paymentMode}</div>
                  <div className="text-xs text-on-surface-variant max-w-[200px] truncate" title={item.paymentDetails}>{item.paymentDetails}</div>
                </td>
                <td className="p-4">
                  {item.status === 'pending' && <span className="bg-amber-500/20 text-amber-600 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>}
                  {item.status === 'completed' && <span className="bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded text-xs font-bold uppercase">Completed</span>}
                  {item.status === 'rejected' && <span className="bg-error/20 text-error px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>}
                  {item.status === 'rejected' && item.rejectReason && (
                    <div className="text-xs text-error mt-1 max-w-[120px] truncate" title={item.rejectReason}>{item.rejectReason}</div>
                  )}
                </td>
                <td className="p-4 flex items-center justify-end gap-2">
                  {item.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(item._id)} 
                        disabled={isProcessing}
                        className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50" 
                        title="Approve (Mark as Paid)"
                      >
                        <IconCheck size={20} />
                      </button>
                      <button 
                        onClick={() => openRejectModal(item)} 
                        disabled={isProcessing}
                        className="p-2 text-error hover:bg-error/10 rounded-lg disabled:opacity-50" 
                        title="Reject Request"
                      >
                        <IconX size={20} />
                      </button>
                    </>
                  )}
                  {item.status !== 'pending' && (
                    <span className="text-xs text-on-surface-variant italic">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant">No withdrawal requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-error"><IconX /> Reject Withdrawal</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Please provide a reason for rejecting the withdrawal request for <strong>{currentWithdrawal?.affiliateId?.name}</strong>.
            </p>
            <form onSubmit={handleReject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Reason</label>
                <textarea 
                  placeholder="e.g. Invalid payment details..." 
                  required 
                  value={rejectReason} 
                  onChange={e => setRejectReason(e.target.value)} 
                  className="px-4 py-2 rounded-lg bg-surface-container border border-[var(--border-floating-card)] text-on-surface min-h-[100px]"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsRejectModalOpen(false)} 
                  className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="bg-error text-on-error px-4 py-2 rounded-lg font-bold disabled:opacity-70 flex items-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
