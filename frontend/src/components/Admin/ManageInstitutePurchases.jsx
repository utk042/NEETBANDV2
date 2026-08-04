import React, { useState, useEffect } from 'react';
import { getInstitutePurchases } from '../../services/api';
import { IconSchool, IconSearch, IconReceipt, IconMail, IconPhone } from '@tabler/icons-react';

export default function ManageInstitutePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await getInstitutePurchases();
      setPurchases(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch institute purchases');
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const term = searchTerm.toLowerCase();
    const userName = (p.user?.name || '').toLowerCase();
    const userEmail = (p.user?.email || '').toLowerCase();
    const userPhone = (p.shippingDetails?.phone || '').toLowerCase();
    return userName.includes(term) || userEmail.includes(term) || userPhone.includes(term);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-error/10 text-error rounded-xl font-medium">{error}</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 tracking-tight">
            <IconSchool className="text-primary" size={28} />
            Institute Purchases
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm md:text-base">
            Manage users who have purchased institute plans and access their details.
          </p>
        </div>
        
        <div className="relative w-full md:w-64 flex-shrink-0">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            className="w-full bg-surface-variant border border-outline-variant/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/70"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <div className="bg-surface-variant/30 border border-outline-variant/30 rounded-2xl p-12 text-center flex flex-col items-center">
          <IconSchool size={48} className="text-on-surface-variant/50 mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">No Institute Purchases Found</h3>
          <p className="text-on-surface-variant">There are currently no users who have purchased an institute plan.</p>
        </div>
      ) : (
        <div className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50 text-on-surface font-semibold text-sm border-b border-outline-variant/50">
                  <th className="px-6 py-4 whitespace-nowrap">User</th>
                  <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                  <th className="px-6 py-4 whitespace-nowrap">Plan</th>
                  <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-on-surface">{purchase.user?.name || 'Unknown User'}</div>
                      <div className="text-on-surface-variant text-xs mt-0.5">{purchase.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {purchase.shippingDetails?.phone ? (
                        <div className="flex items-center gap-1.5 text-on-surface">
                          <IconPhone size={14} className="text-primary" />
                          {purchase.shippingDetails.phone}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant italic">No phone</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {purchase.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-on-surface">
                      ₹{purchase.amount}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(purchase.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`/receipt/${purchase._id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 text-on-surface text-xs font-medium rounded-lg transition-colors border border-outline-variant/50"
                      >
                        <IconReceipt size={16} /> Receipt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
