import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconCurrencyRupee, 
  IconLink,
  IconLogout,
  IconChevronLeft,
  IconReceipt
} from '@tabler/icons-react';
import { getAffiliateDashboard } from '../../services/api';

export default function AffiliateDashboard({ user, setCurrentPage }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAffiliateDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && user.isLoggedIn) {
      fetchData();
    } else {
      setCurrentPage('affiliate-login');
    }
  }, [user, setCurrentPage]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('neetband_affiliate_user');
      localStorage.removeItem('affiliate_token');
      setCurrentPage('home');
      window.location.reload(); // Quick way to clear state
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-error/10 text-error p-6 rounded-2xl max-w-md text-center">
          <p className="font-bold mb-4">{error}</p>
          <button onClick={handleLogout} className="bg-error text-on-error px-4 py-2 rounded-lg">
            Logout and Try Again
          </button>
        </div>
      </div>
    );
  }

  const affiliatedUsers = dashboardData?.affiliatedUsers || [];
  const settlements = dashboardData?.settlements || [];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-[var(--border-floating-card)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage('home')}
            className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-on-surface">Affiliate Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-on-surface">{user.name}</p>
            <p className="text-xs text-on-surface-variant">Affiliate Partner</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
            title="Logout"
          >
            <IconLogout size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8 mt-4">
        
        {/* Welcome Section */}
        <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Welcome back, {user.name}!</h2>
            <p className="text-on-surface-variant">Here is your referral overview and earnings.</p>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-[var(--border-floating-card)] shadow-sm flex items-center gap-4 min-w-[240px]">
            <div className="p-3 bg-primary/20 text-primary rounded-xl">
              <IconLink size={24} />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">Your Promo Code</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">
                  {dashboardData?.promoCode}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-500/20 text-green-600 rounded-2xl">
              <IconCurrencyRupee size={32} />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total Earnings</p>
              <h3 className="text-3xl font-bold text-on-surface">₹{dashboardData?.earnings || 0}</h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-500/20 text-blue-600 rounded-2xl">
              <IconUsers size={32} />
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total Referrals</p>
              <h3 className="text-3xl font-bold text-on-surface">{affiliatedUsers.length}</h3>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Referrals List */}
          <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--border-floating-card)]">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <IconUsers size={20} className="text-primary" />
                Your Referrals
              </h3>
            </div>
            <div className="p-0 overflow-y-auto max-h-[400px]">
              {affiliatedUsers.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <p>No referrals yet. Share your promo code to start earning!</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-floating-card)]">
                  {affiliatedUsers.map((item, idx) => (
                    <li key={idx} className="p-4 hover:bg-surface-container transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-on-surface">{item.userId?.name || 'Unknown User'}</p>
                        <p className="text-xs text-on-surface-variant">{item.userId?.email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-on-surface bg-surface-container-high px-2 py-1 rounded">
                          {item.plan === 'scale_plan' ? 'Scale Plan' : 'Premium Scholar'}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {new Date(item.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Settlements List */}
          <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--border-floating-card)]">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <IconReceipt size={20} className="text-primary" />
                Settlement History
              </h3>
            </div>
            <div className="p-0 overflow-y-auto max-h-[400px]">
              {settlements.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <p>No settlements yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border-floating-card)]">
                  {settlements.map((item, idx) => (
                    <li key={idx} className="p-4 hover:bg-surface-container transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-bold text-on-surface text-lg flex items-center">
                           <IconCurrencyRupee size={16} />{item.amount}
                        </p>
                        <p className="text-sm text-on-surface-variant">{item.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
