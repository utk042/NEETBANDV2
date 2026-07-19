import React, { useState, useEffect } from 'react';
import { getAdminStats, updateLmsUserProfile } from '../../services/api';
import EditProfileModal from '../Common/EditProfileModal';
import ManageSongs from './ManageSongs';
import ManageLMS from './ManageLMS';
import CourseDesigner from './CourseDesigner';
import AdminBlogs from './AdminBlogs';
import AdminForums from './AdminForums';
import AdminAffiliates from './AdminAffiliates';
import ManageContactMessages from './ManageContactMessages';
import ManageNewsScroll from './ManageNewsScroll';
import SongAnalyticsDashboard from './SongAnalyticsDashboard';
import ManageNewsletter from './ManageNewsletter';
import ManageBookOrders from './ManageBookOrders';
import ManageEyeCheckups from './ManageEyeCheckups';
import AdSettings from './AdSettings';
import api from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { 
  IconMusic, 
  IconBook, 
  IconLayoutDashboard, 
  IconLogout, 
  IconUser, 
  IconCash,
  IconUsers,
  IconFileText,
  IconClock,
  IconShieldLock,
  IconCrown,
  IconPencil,
  IconArrowRight,
  IconSun,
  IconMoon,
  IconMenu2,
  IconX,
  IconChevronDown,
  IconSettings,
  IconSchool,
  IconBrandBlogger,
  IconMessageCircle,
  IconAffiliate,
  IconBuildingBank,
  IconMail,
  IconChartBar,
  IconMailOpened,
  IconEye
} from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard({ navigate, user, theme, setTheme }) {
  const { confirm } = useDialog();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [stats, setStats] = useState({ 
    totalStudents: 0,
    teachers: 0,
    totalTracks: 0, 
    premiumTracks: 0, 
    freeTracks: 0,
    learningModules: 0, 
    quizzes: 0,
    completionRate: 0,
    loading: true 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats({ ...data, loading: false });
      } catch (err) {
        console.error(err);
        setStats(s => ({ ...s, loading: false }));
      }
    };
    fetchStats();
  }, []);

  useEffect(() => { setCurrentUser(user); }, [user]);

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-error text-xl font-bold">
        Unauthorized. Admin or Owner access required.
      </div>
    );
  }

  const handleLogout = async () => {
    const isConfirmed = await confirm("Confirm Log Out", "Are you sure you want to log out of the LMS Panel?");
    if (isConfirmed) {
      localStorage.removeItem('neetband_lms_user');
      localStorage.removeItem('lms_token');
      navigate('/');
    }
  };

  const handleProfileUpdate = async (updatedUser) => {
    try {
      const data = await updateLmsUserProfile(updatedUser);
      const fullUpdatedUser = {
        ...currentUser,
        name: data.name || updatedUser.name,
        email: data.email || currentUser.email,
      };
      localStorage.setItem('neetband_lms_user', JSON.stringify(fullUpdatedUser));
      setCurrentUser(fullUpdatedUser);
    } catch (err) {
      console.error('[AdminDashboard] handleProfileUpdate failed:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false); // Close sidebar on mobile after clicking a tab
    
    // Update URL without triggering a full page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', tab);
    window.history.pushState({}, '', newUrl);
  };

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
            LMS Panel
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
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="px-6 py-4 flex items-center gap-4 mb-4 w-full text-left rounded-xl hover:bg-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-surface-variant border border-outline-variant/50 rounded-full overflow-hidden flex items-center justify-center text-on-surface flex-shrink-0 shadow-sm">
            {currentUser.profilePicture ? (
              <img 
                src={currentUser.profilePicture.startsWith('http') ? currentUser.profilePicture : `${API_URL}${currentUser.profilePicture}`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <IconUser size={24} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-on-surface text-[15px] leading-tight">{currentUser.name || 'Admin'}</h3>
            <p className="text-on-surface-variant text-xs mt-0.5 capitalize">{currentUser.role}</p>
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
            onClick={() => changeTab('songs')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'songs' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconMusic size={20} stroke={2.5} /> Manage Songs
          </button>

          <button
            onClick={() => changeTab('song-analytics')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'song-analytics' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconChartBar size={20} stroke={2.5} /> Song Analytics
          </button>

          <button
            onClick={() => changeTab('ad-settings')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'ad-settings' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconSettings size={20} stroke={2.5} /> Ad Settings
          </button>
          
          <button 
            onClick={() => changeTab('lms-courses')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'lms-courses' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconBook size={20} stroke={2.5} /> Courses
          </button>
          <button
            onClick={() => changeTab('lms-students')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'lms-students' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconUsers size={20} stroke={2.5} /> Students
          </button>

          <button
            onClick={() => changeTab('blogs')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'blogs' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconBrandBlogger size={20} stroke={2.5} /> Blogs
          </button>

          <button
            onClick={() => changeTab('feed')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'feed' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconMessageCircle size={20} stroke={2.5} /> Feed
          </button>

          <button
            onClick={() => changeTab('affiliates')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'affiliates' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconAffiliate size={20} stroke={2.5} /> Affiliates
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => changeTab('lms-admins')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
                activeTab === 'lms-admins' 
                  ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              <IconShieldLock size={20} stroke={2.5} /> Manage Admins
            </button>
          )}

          <button
            onClick={() => changeTab('contact-messages')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'contact-messages' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconMail size={20} stroke={2.5} /> Contact Messages
          </button>

          <button
            onClick={() => changeTab('news-scroll')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'news-scroll' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconSettings size={20} stroke={2.5} /> News Scroller
          </button>

          <button
            onClick={() => changeTab('newsletter')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'newsletter' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconMailOpened size={20} stroke={2.5} /> Newsletter
          </button>

          <button
            onClick={() => changeTab('book-orders')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'book-orders' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconBook size={20} stroke={2.5} /> Book Orders
          </button>

          <button
            onClick={() => changeTab('eye-checkups')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
              activeTab === 'eye-checkups' 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <IconEye size={20} stroke={2.5} /> Eye Checkups
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
            <span className="font-bold text-on-surface tracking-tight text-lg">LMS Panel</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
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
              <p className="text-on-surface-variant text-[14px] md:text-[15px] mb-6 md:mb-8">Welcome back! Here's what's happening.</p>

              {/* Large Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                
                {/* Students Card (Emerald) */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Total Students</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{stats.loading ? '-' : stats.totalStudents}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Active learners</p>
                    <button className="text-emerald-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap">
                      View All <IconArrowRight size={16} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-emerald-500/20">
                    <IconUsers size={20} className="text-emerald-500 md:w-6 md:h-6" />
                  </div>
                </div>

                {/* Total Tracks Card (Blue) */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Total Tracks</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{stats.loading ? '-' : stats.totalTracks}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Uploaded audio files</p>
                    <button onClick={() => changeTab('songs')} className="text-blue-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Manage <IconArrowRight size={16} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-blue-500/20">
                    <IconMusic size={20} className="text-blue-500 md:w-6 md:h-6" />
                  </div>
                </div>

                {/* Modules Card (Purple) */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Learning Modules</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{stats.loading ? '-' : stats.learningModules}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Organized courses</p>
                    <button onClick={() => changeTab('lms-courses')} className="text-purple-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Manage <IconArrowRight size={16} />
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-purple-500/20">
                    <IconBook size={20} className="text-purple-500 md:w-6 md:h-6" />
                  </div>
                </div>

                {/* Premium Content Card (Amber) */}
                <div className="bg-surface border border-outline-variant/30 text-on-surface rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg shadow-black/5 transition-colors duration-300">
                  <div className="relative z-10">
                    <p className="text-on-surface-variant font-medium text-xs md:text-sm mb-1">Premium Content</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">{stats.loading ? '-' : stats.premiumTracks}</h2>
                    <p className="text-on-surface-variant text-xs md:text-sm mb-4">Locked for subscribers</p>
                    <button className="text-amber-500 font-medium text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all opacity-0 whitespace-nowrap">
                      View All
                    </button>
                  </div>
                  <div className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm z-10 border border-amber-500/20">
                    <IconCrown size={20} className="text-amber-500 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>

              {/* Small Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-surface rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shadow-sm border border-outline-variant/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                    <IconShieldLock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg md:text-xl leading-tight">{stats.loading ? '-' : stats.teachers}</h3>
                    <p className="text-on-surface-variant text-[11px] md:text-xs">Teachers</p>
                  </div>
                </div>
                
                <div className="bg-surface rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shadow-sm border border-outline-variant/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                    <IconMusic size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg md:text-xl leading-tight">{stats.loading ? '-' : stats.freeTracks}</h3>
                    <p className="text-on-surface-variant text-[11px] md:text-xs">Free Tracks</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shadow-sm border border-outline-variant/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                    <IconPencil size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg md:text-xl leading-tight">{stats.loading ? '-' : stats.quizzes}</h3>
                    <p className="text-on-surface-variant text-[11px] md:text-xs">Quizzes</p>
                  </div>
                </div>

                <div className="bg-surface rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shadow-sm border border-outline-variant/30 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                    <IconFileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg md:text-xl leading-tight">{stats.loading ? '-' : `${stats.completionRate}%`}</h3>
                    <p className="text-on-surface-variant text-[11px] md:text-xs">Completion Rate</p>
                  </div>
                </div>
              </div>

              {/* Bottom Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30 min-h-[250px] md:min-h-[300px] transition-colors duration-300">
                  <h3 className="font-bold text-on-surface mb-6">Student Activity</h3>
                  <div className="flex justify-center relative mt-6 md:mt-10">
                    <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="70" stroke="currentColor" className="text-blue-500/20" strokeWidth="30" fill="none" />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        stroke="currentColor" 
                        className="text-blue-500" 
                        strokeWidth="30" 
                        fill="none" 
                        strokeDasharray="440" 
                        strokeDashoffset={440 - (440 * ((stats.avgScore || 0) / 100))} 
                        style={{ transition: 'all 1s ease-out' }} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-on-surface">{stats.avgScore || 0}%</span>
                      <span className="text-xs text-on-surface-variant">Avg Score</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/30 min-h-[250px] md:min-h-[300px] transition-colors duration-300">
                  <h3 className="font-bold text-on-surface mb-6">Premium vs Free Content</h3>
                  <div className="flex justify-center relative mt-6 md:mt-10">
                    <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90" viewBox="0 0 192 192">
                      <circle cx="96" cy="96" r="70" stroke="currentColor" className="text-amber-500/20" strokeWidth="30" fill="none" />
                      <circle 
                        cx="96" 
                        cy="96" 
                        r="70" 
                        stroke="currentColor" 
                        className="text-amber-500" 
                        strokeWidth="30" 
                        fill="none" 
                        strokeDasharray="440" 
                        strokeDashoffset={stats.totalTracks > 0 ? 440 - (440 * (stats.premiumTracks / stats.totalTracks)) : 440} 
                        style={{ transition: 'all 1s ease-out' }} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-on-surface">{stats.totalTracks > 0 ? Math.round((stats.premiumTracks / stats.totalTracks) * 100) : 0}%</span>
                      <span className="text-xs text-on-surface-variant">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'songs' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageSongs />
              </div>
            </div>
          )}

          {activeTab.startsWith('lms') && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageLMS subTab={activeTab.replace('lms-', '')} user={user} />
              </div>
            </div>
          )}
          
          {activeTab === 'blogs' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <AdminBlogs api={api} />
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <AdminForums api={api} />
              </div>
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <AdminAffiliates />
              </div>
            </div>
          )}

          {activeTab === 'contact-messages' && (
            <div className="max-w-6xl mx-auto pb-8">
              <ManageContactMessages />
            </div>
          )}

          {activeTab === 'news-scroll' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageNewsScroll />
              </div>
            </div>
          )}

          {activeTab === 'song-analytics' && (
            <div className="max-w-6xl mx-auto pb-8">
              <SongAnalyticsDashboard />
            </div>
          )}

          {activeTab === 'ad-settings' && (
            <div className="max-w-6xl mx-auto pb-8">
              <AdSettings />
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageNewsletter />
              </div>
            </div>
          )}

          {activeTab === 'book-orders' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageBookOrders />
              </div>
            </div>
          )}

          {activeTab === 'eye-checkups' && (
            <div className="max-w-6xl mx-auto pb-8">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 md:p-8 transition-colors duration-300">
                <ManageEyeCheckups />
              </div>
            </div>
          )}

        </div>
      </main>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSave={handleProfileUpdate}
      />

    </div>
  );
}
