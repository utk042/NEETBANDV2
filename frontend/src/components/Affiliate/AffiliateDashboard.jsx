import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconCurrencyRupee, 
  IconLink,
  IconLogout,
  IconChevronLeft,
  IconReceipt,
  IconSun,
  IconMoon,
  IconMenu2,
  IconX,
  IconLayoutDashboard,
  IconArrowRight,
  IconCopy,
  IconCheck
} from '@tabler/icons-react';
import { getAffiliateDashboard, updateAffiliateProfile } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import EditProfileModal from '../Common/EditProfileModal';

export default function AffiliateDashboard({ user, onUserUpdate, navigate, theme, setTheme }) {
  const { toast, confirm } = useDialog();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      navigate('/affiliate-login');
    }
  }, [user?._id, user?.isLoggedIn, navigate]);

  const handleLogout = async () => {
    const isConfirmed = await confirm("Confirm Log Out", "Are you sure you want to log out of the Affiliate Portal?");
    if (isConfirmed) {
      localStorage.removeItem('neetband_affiliate_user');
      localStorage.removeItem('affiliate_token');
      navigate('/');
      window.location.reload(); // Quick way to clear state
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after clicking a tab
    
    // Update URL without triggering a full page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', tab);
    window.history.pushState({}, '', newUrl);
  };

  const handleCopyCode = () => {
    if (dashboardData?.promoCode) {
      navigator.clipboard.writeText(dashboardData.promoCode);
      setIsCopied(true);
      toast.success("Promo code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    const forceLogout = () => {
      localStorage.removeItem('neetband_affiliate_user');
      localStorage.removeItem('affiliate_token');
      navigate('/');
      window.location.reload();
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="bg-error/10 text-error p-6 rounded-2xl max-w-md text-center">
          <p className="font-bold mb-4">{error}</p>
          <button onClick={forceLogout} className="bg-error text-on-error px-4 py-2 rounded-lg">
            Logout and Try Again
          </button>
        </div>
      </div>
    );
  }

  const affiliatedUsers = dashboardData?.affiliatedUsers || [];
  const settlements = dashboardData?.settlements || [];

  return (
    <div className="fixed inset-0 w-full bg-background overflow-hidden font-sans text-on-background z-modal flex transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 h-full w-[280px] bg-surface flex flex-col flex-shrink-0 
        shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-outline-variant/30 
        transition-all duration-300 z-50 md:z-10 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <div className="bg-primary text-on-primary font-bold text-lg px-6 py-2 rounded-xl inline-flex items-center justify-center shadow-sm shadow-primary/20">
            Affiliate Partner
          </div>
          <button 
            className="md:hidden text-on-surface-variant hover:text-on-surface"
            onClick={() => setIsSidebarOpen(false)}
          >
            <IconX size={24} />
          </button>
        </div>

        {/* User Profile Section */}
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          title="Edit Profile"
          className="mx-4 px-4 py-3 flex items-center gap-4 mb-4 text-left rounded-2xl hover:bg-surface-variant/40 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div className="w-12 h-12 bg-surface-variant border border-outline-variant/50 rounded-full flex items-center justify-center text-on-surface flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <IconUsers size={24} />
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-[15px] leading-tight group-hover:text-primary transition-colors duration-200">
              {user?.name || 'Partner'}
            </h3>
            <p className="text-on-surface-variant text-xs mt-0.5 capitalize">Affiliate Partner</p>
          </div>
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <button
            onClick={() => changeTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconLayoutDashboard size={20} stroke={2.5} /> Dashboard
          </button>
          
          <button
            onClick={() => changeTab('referrals')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'referrals' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconUsers size={20} stroke={2.5} /> Referrals
          </button>

          <button
            onClick={() => changeTab('settlements')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'settlements' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconReceipt size={20} stroke={2.5} /> Settlements
          </button>
        </nav>

        {/* Logout Section */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-error/90 hover:bg-error text-on-error rounded-xl font-bold transition-colors shadow-md shadow-error/20"
          >
            <IconLogout size={20} stroke={2.5} className="rotate-180" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background transition-colors duration-300 relative w-full">
        
        {/* Top Header */}
        <header className="h-[72px] bg-surface flex items-center justify-between md:justify-end px-4 md:px-8 flex-shrink-0 border-b border-outline-variant/30 z-0 transition-colors duration-300 w-full">
          
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors"
            >
              <IconMenu2 size={24} />
            </button>
            <span className="font-bold text-on-surface tracking-tight text-lg">Affiliate Portal</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'dark' ? <IconSun size={22} /> : <IconMoon size={22} />}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 text-on-background">
          
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-[24px] md:text-[28px] font-bold text-on-surface mb-1 tracking-tight">Dashboard</h1>
              <p className="text-on-surface-variant text-[14px] md:text-[15px] mb-6 md:mb-8">Welcome back! Here's your referral overview and earnings.</p>

              {/* Welcome Card */}
              <div className="bg-primary/10 rounded-2xl p-6 md:p-8 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">Welcome back, {user.name}!</h2>
                  <p className="text-on-surface-variant">Here is your referral overview and earnings.</p>
                </div>
                <div className="bg-surface rounded-2xl p-4 border border-outline-variant/30 shadow-sm flex items-center gap-4 min-w-[240px]">
                  <div className="p-3 bg-primary/20 text-primary rounded-xl">
                    <IconLink size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium mb-1">Your Promo Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded select-all">
                        {dashboardData?.promoCode}
                      </code>
                      <button
                        onClick={handleCopyCode}
                        className="p-1.5 hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Copy Promo Code"
                      >
                        {isCopied ? <IconCheck size={18} className="text-green-500" /> : <IconCopy size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Earnings card */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Total Earnings</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">₹{dashboardData?.earnings || 0}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Paid and pending payouts</p>
                    <button onClick={() => changeTab('settlements')} className="text-emerald-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      View Settlements <IconArrowRight size={16} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-emerald-500/20">
                    <IconCurrencyRupee size={24} className="text-emerald-500 md:w-6 md:h-6" />
                  </div>
                </div>

                {/* Referrals card */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Total Referrals</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{affiliatedUsers.length}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Users registered with your code</p>
                    <button onClick={() => changeTab('referrals')} className="text-blue-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      View Referrals <IconArrowRight size={16} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-blue-500/20">
                    <IconUsers size={24} className="text-blue-500 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="max-w-6xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-[24px] md:text-[28px] font-bold text-on-surface mb-1 tracking-tight">Your Referrals</h1>
              <p className="text-on-surface-variant text-[14px] md:text-[15px] mb-6 md:mb-8">Detailed breakdown of users referred by you.</p>

              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                {affiliatedUsers.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <p>No referrals yet. Share your promo code to start earning!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold text-sm">
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Plan Type</th>
                          <th className="p-4">Join Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {affiliatedUsers.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-variant/20 transition-colors">
                            <td className="p-4 font-medium text-on-surface">{item.userId?.name || 'Unknown User'}</td>
                            <td className="p-4 text-on-surface-variant">{item.userId?.email || 'No email'}</td>
                            <td className="p-4">
                              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                {item.plan === 'scale_plan' ? 'Scale Plan' : 'Premium Scholar'}
                              </span>
                            </td>
                            <td className="p-4 text-on-surface-variant">
                              {new Date(item.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="max-w-6xl mx-auto pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-[24px] md:text-[28px] font-bold text-on-surface mb-1 tracking-tight">Settlement History</h1>
              <p className="text-on-surface-variant text-[14px] md:text-[15px] mb-6 md:mb-8">History of payments processed for your referrals.</p>

              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                {settlements.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant">
                    <p>No settlements yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold text-sm">
                          <th className="p-4">Amount</th>
                          <th className="p-4">Notes</th>
                          <th className="p-4">Settlement Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {settlements.map((item, idx) => (
                          <tr key={idx} className="hover:bg-surface-variant/20 transition-colors">
                            <td className="p-4 font-bold text-green-600 flex items-center gap-0.5">
                              <IconCurrencyRupee size={16} />
                              {item.amount}
                            </td>
                            <td className="p-4 text-on-surface-variant max-w-xs truncate" title={item.notes}>
                              {item.notes}
                            </td>
                            <td className="p-4 text-on-surface-variant">
                              {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        currentUser={user} 
        onSave={onUserUpdate} 
        updateApiFn={updateAffiliateProfile} 
      />

    </div>
  );
}
