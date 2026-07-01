import React, { useState, useEffect } from 'react';

import { 
  IconUser, IconHeart, IconBrain, IconBell, 
  IconFlame, IconClock, IconLogout, IconArrowRight, 
  IconCheck, IconChevronRight, IconBook, IconSchool,
  IconAward, IconPlayerPlayFilled, IconBookmark, IconTrendingUp,
  IconCertificate, IconX, IconPencil, IconCrown
} from '@tabler/icons-react';
import { getUserProfile } from '../services/api';

const AVATARS = [
  { id: 'general', label: 'Reader', icon: IconBook, color: 'bg-amber-500/10 text-primary border-primary/20' },
  { id: 'bio', label: 'Bio Explorer', icon: IconBrain, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'academic', label: 'Scholar', icon: IconSchool, color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  { id: 'champ', label: 'Achiever', icon: IconAward, color: 'bg-red-500/10 text-red-500 border-red-500/20' }
];



export default function Dashboard({ 
  setCurrentPage, 
  tracks, 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  currentTime, 
  favoritedTrackIds, 
  onToggleFavorite,
  user,
  setUser,
  recentlyPlayedTrackIds
}) {
  // Load user details with defaults
  const profileName = user?.name || '';
  const profileEmail = user?.email || '';
  const profileClass = user?.class || 'Class 12';
  const profilePrefs = user?.preferences || ['Biology', 'Chemistry'];
  const profileGoal = user?.studyGoal || '30 mins';
  const profileAvatar = user?.avatar || 'general';

  // Form states
  const [profileData, setProfileData] = useState(null);
  
  // Fetch real profile data on mount
  useEffect(() => {
    if (user?.isLoggedIn) {
      getUserProfile()
        .then(data => {
          setProfileData(data);
        })
        .catch(err => console.error("Failed to load user profile:", err));
    }
  }, [user?.isLoggedIn]);

  const [editName, setEditName] = useState(user?.name || '');
  const [editClass, setEditClass] = useState(profileClass);
  const [editPrefs, setEditPrefs] = useState(profilePrefs);
  const [editGoal, setEditGoal] = useState(profileGoal);
  const [editAvatar, setEditAvatar] = useState(profileAvatar);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setEditName(user?.name || '');
    setEditClass(user?.class || 'Class 12');
    setEditPrefs(user?.preferences || ['Biology', 'Chemistry']);
    setEditGoal(user?.studyGoal || '30 mins');
    setEditAvatar(user?.avatar || 'general');
  }, [user]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isProfileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isProfileModalOpen]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg('Full name cannot be empty');
      return;
    }
    
    setErrorMsg(null);
    setSaveSuccess(false);

    const updatedUser = {
      ...user,
      name: editName,
      class: editClass,
      preferences: editPrefs,
      studyGoal: editGoal,
      avatar: editAvatar
    };

    setUser(updatedUser);
    localStorage.setItem('neetband_current_user', JSON.stringify(updatedUser));

    let existingUsers = [];
    try {
      const stored = localStorage.getItem('neetband_users');
      existingUsers = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(existingUsers)) existingUsers = [];
    } catch (err) {
      existingUsers = [];
    }
    const idx = existingUsers.findIndex(u => u.email.toLowerCase() === profileEmail.toLowerCase());
    if (idx !== -1) {
      existingUsers[idx] = {
        ...existingUsers[idx],
        name: editName,
        class: editClass,
        preferences: editPrefs,
        studyGoal: editGoal,
        avatar: editAvatar
      };
      localStorage.setItem('neetband_users', JSON.stringify(existingUsers));
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsProfileModalOpen(false);
    }, 1500);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('neetband_current_user');
      setUser({ isLoggedIn: false, name: '', email: '' });
      setCurrentPage('home');
    }
  };

  // Get favorite tracks data
  const favoriteTracksList = tracks.filter(t => favoritedTrackIds?.includes(t.id));

  // Get recently played tracks data
  const recentTracksList = (recentlyPlayedTrackIds || []).map(id => tracks.find(t => t.id === id)).filter(Boolean);

  // Generate a nice avatar URL based on the user's name using Dicebear
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profileName || 'Student'}&backgroundColor=b6e3f4`;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-32 transition-colors duration-300 relative overflow-hidden">
      
      {/* Ambient orbs — matches site-wide style */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06] bg-primary pointer-events-none" />
      <div className="absolute top-[20%] left-[-8%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.04] bg-primary pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 mt-12">
        
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          {/* Header Greeting */}
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-16 md:mb-20">
            <div className="max-w-2xl mt-2 md:mt-0">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                Welcome back, <br className="md:hidden" />
                <span className="text-primary">{profileName.split(' ')[0] || 'Student'}</span>.
              </h1>
              <p className="mt-4 md:mt-6 text-lg text-on-surface-variant leading-relaxed">
                Your daily goal is set to <strong className="text-on-surface">{editGoal}</strong>. Let's focus and make this session count for your {editClass} prep.
              </p>
            </div>
            
            {/* Interactive Profile Avatar */}
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="group relative w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center shrink-0 shadow-lg border-[4px] border-surface-container overflow-hidden hover:border-primary/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 self-start md:self-auto"
              aria-label="Edit Profile"
            >
              <img 
                src={avatarUrl} 
                alt={`${profileName}'s Avatar`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <IconPencil size={24} className="text-white" />
              </div>
            </button>
          </div>

          {/* Unified Progress Module */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 py-8 mb-16">
            
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3 flex items-center gap-2">
                <IconHeart size={14} className="text-primary" /> Saved Tracks
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-none">
                  {favoriteTracksList.length}
                </span>
                <span className="text-lg font-semibold text-on-surface-variant">Songs</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3 flex items-center gap-2">
                <IconClock size={14} className="text-primary" /> Goal Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-none">
                  0
                </span>
                <span className="text-lg font-semibold text-on-surface-variant">/ {editGoal.replace(' mins', '')}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[0%]" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-3 flex items-center gap-2">
                <IconFlame size={14} className="text-primary" /> Study Streak
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface leading-none">
                  {profileData?.streak || 0}
                </span>
                <span className="text-lg font-semibold text-on-surface-variant">Days</span>
              </div>
            </div>

          </div>

          {/* ENROLLED COURSES */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-8 flex items-center gap-2">
              <IconSchool className="text-primary" size={28} strokeWidth={1.5} /> Enrolled Courses
            </h2>
            
            {profileData?.progress && profileData.progress.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.progress.map((prog, index) => {
                  const course = prog.courseId;
                  if (!course) return null; // Defensive check
                  const percentage = course.lessons?.length > 0 
                    ? Math.round((prog.score / course.lessons.length) * 100) || 0 
                    : 0;

                  return (
                    <div key={index} className="bg-surface-container-low rounded-[32px] p-8 hover:bg-surface-container transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold bg-surface px-3 py-1.5 rounded-lg shadow-sm">
                            {course.subject || 'Course'}
                          </span>
                          <span className="text-xl font-mono font-bold text-primary">{percentage}%</span>
                        </div>
                        <h3 className="text-[22px] font-extrabold text-on-surface mb-2">{course.title}</h3>
                        <p className="text-[15px] text-on-surface-variant leading-relaxed mb-8 max-w-sm line-clamp-2">
                          {course.summary || 'Continue learning this course.'}
                        </p>
                      </div>
                      <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-[32px] p-8 text-center">
                <p className="text-on-surface-variant">You are not enrolled in any courses yet.</p>
              </div>
            )}
          </div>

          {/* YOUR SUBSCRIPTION */}
          <div className="mb-24">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-8 flex items-center gap-2">
              <IconCertificate className="text-primary" size={28} strokeWidth={1.5} /> Your Subscription
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-surface-container-low rounded-[32px] p-8 md:p-10 border border-outline/10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[11px] font-mono uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg shadow-sm ${user?.isPremium ? 'bg-primary/10 text-primary' : 'bg-surface text-on-surface-variant'}`}>
                      {user?.isPremium ? 'Active Plan' : 'Free Tier'}
                    </span>
                    {user?.isPremium && (
                      <span className="flex items-center gap-1 text-sm font-bold text-emerald-500">
                        <IconCheck size={16} /> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-extrabold text-on-surface mb-3 flex items-center gap-3">
                    {user?.isPremium ? 'Premium Scholar' : 'Basic Listener'}
                    {user?.isPremium && <IconCrown className="text-primary" size={32} />}
                  </h3>
                  <p className="text-[15px] text-on-surface-variant leading-relaxed max-w-lg">
                    {user?.isPremium 
                      ? "You have full access to all premium tracks, offline downloads, and ad-free listening. Enjoy the full NeetBand experience!"
                      : "You are currently on the free plan. Upgrade to access all 2000+ songs, premium quizzes, and offline downloads."}
                  </p>
                </div>
                
                <div className="shrink-0 flex flex-col items-start md:items-end gap-4">
                  {!user?.isPremium ? (
                    <button 
                      onClick={() => setCurrentPage('pricing')}
                      className="bg-primary text-on-primary font-bold px-8 py-4 rounded-xl hover:bg-primary-fixed hover:-translate-y-0.5 transition-all shadow-sm"
                    >
                      Upgrade to Premium
                    </button>
                  ) : (
                    <div className="text-left md:text-right">
                      <p className="text-sm font-bold text-on-surface-variant mb-1">Membership Plan</p>
                      <p className="text-xl font-mono text-on-surface capitalize">{user?.membershipPlan?.replace('_', ' ') || 'Premium'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Favourites & Recently Played */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Favourites Widget */}
            <div className="flex flex-col bg-surface-container-low rounded-[32px] p-8 h-full shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Your Favourites</h2>
                {favoriteTracksList.length > 0 && (
                  <button 
                    onClick={() => setCurrentPage('library')}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                  >
                    Browse Library <IconArrowRight size={16} />
                  </button>
                )}
              </div>

              {favoriteTracksList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center flex-1 py-8">
                  <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-6 shadow-inner">
                    <IconHeart size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-on-surface mb-3">No favourites yet</h3>
                  <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-[280px]">
                    Hit the heart icon on any track in the library to save it here for quick access.
                  </p>
                  <button 
                    onClick={() => setCurrentPage('library')}
                    className="mt-8 px-8 py-3.5 rounded-xl bg-on-surface text-surface font-extrabold text-[15px] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Explore Library
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 flex-1">
                  {favoriteTracksList.slice(0, 5).map((track, idx) => {
                    const isCurrent = currentTrack && currentTrack.id === track.id;
                    const isLiked = true;

                    return (
                      <div 
                        key={track.id}
                        role="button"
                        onClick={() => onTrackSelect(track)}
                        className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                          isCurrent ? 'bg-primary/5 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.2)]' : 'hover:bg-surface-container/50'
                        }`}
                      >
                        {/* Number or Play icon */}
                        <div className="w-5 shrink-0 flex items-center justify-center text-on-surface-variant font-mono text-xs opacity-70">
                          {isCurrent ? (
                            <IconPlayerPlayFilled size={12} className="text-primary" />
                          ) : (
                            <span className="group-hover:hidden">{(idx + 1).toString().padStart(2, '0')}</span>
                          )}
                          {!isCurrent && <IconPlayerPlayFilled size={12} className="hidden group-hover:block" />}
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                          <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" />
                          {isCurrent && <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>}
                        </div>
                        
                        {/* Title & Detail */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-bold tracking-tight truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5">
                            {track.subject && <span className="font-semibold text-on-surface-variant/80">{track.subject}</span>}
                            {track.subject && <span className="mx-1.5 opacity-40">•</span>}
                            {track.chapter}
                          </p>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(track.id); }}
                          className={`shrink-0 p-2 rounded-full transition-colors cursor-pointer ${
                            isLiked ? 'text-red-500' : 'text-on-surface-variant/30 hover:text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <IconHeart size={18} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recently Played Widget */}
            <div className="flex flex-col bg-surface-container-low rounded-[32px] p-8 h-full shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Recently Played</h2>
                {recentTracksList.length > 0 && (
                  <button 
                    onClick={() => setCurrentPage('library')}
                    className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                  >
                    Browse Library <IconArrowRight size={16} />
                  </button>
                )}
              </div>

              {recentTracksList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center flex-1 py-8">
                  <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-6 shadow-inner">
                    <IconClock size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-extrabold text-on-surface mb-3">No recent tracks</h3>
                  <p className="text-on-surface-variant text-[15px] leading-relaxed max-w-[280px]">
                    Your recently played tracks will appear here as you listen.
                  </p>
                  <button 
                    onClick={() => setCurrentPage('library')}
                    className="mt-8 px-8 py-3.5 rounded-xl bg-on-surface text-surface font-extrabold text-[15px] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Start Listening
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 flex-1">
                  {recentTracksList.slice(0, 5).map((track, idx) => {
                    const isCurrent = currentTrack && currentTrack.id === track.id;
                    const isLiked = favoritedTrackIds?.includes(track.id);

                    return (
                      <div 
                        key={track.id}
                        role="button"
                        onClick={() => onTrackSelect(track)}
                        className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                          isCurrent ? 'bg-primary/5 shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.2)]' : 'hover:bg-surface-container/50'
                        }`}
                      >
                        {/* Number or Play icon */}
                        <div className="w-5 shrink-0 flex items-center justify-center text-on-surface-variant font-mono text-xs opacity-70">
                          {isCurrent ? (
                            <IconPlayerPlayFilled size={12} className="text-primary" />
                          ) : (
                            <span className="group-hover:hidden">{(idx + 1).toString().padStart(2, '0')}</span>
                          )}
                          {!isCurrent && <IconPlayerPlayFilled size={12} className="hidden group-hover:block" />}
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                          <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" />
                          {isCurrent && <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>}
                        </div>
                        
                        {/* Title & Detail */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-bold tracking-tight truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                            {track.title}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5">
                            {track.subject && <span className="font-semibold text-on-surface-variant/80">{track.subject}</span>}
                            {track.subject && <span className="mx-1.5 opacity-40">•</span>}
                            {track.chapter}
                          </p>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(track.id); }}
                          className={`shrink-0 p-2 rounded-full transition-colors cursor-pointer ${
                            isLiked ? 'text-red-500' : 'text-on-surface-variant/30 hover:text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <IconHeart size={18} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
          
          {/* Logout Button at the bottom */}
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <IconLogout size={20} strokeWidth={2} /> Log Out
            </button>
          </div>

        </div>
      </div>

      {/* ── Profile Edit Modal ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsProfileModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface-container-low rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline/10 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-container-low/95 backdrop-blur z-10 flex justify-between items-center p-6 border-b border-outline/10">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Edit Profile</h2>
                <p className="text-sm text-on-surface-variant">Update your account details and preferences.</p>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <IconX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-6 md:p-8 space-y-10">
              
              {/* Profile Details */}
              <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">Personal Info</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface block">Full Name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-surface border border-outline/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface block">Email (Read Only)</label>
                    <input 
                      type="email"
                      value={profileEmail}
                      disabled
                      className="w-full bg-surface/50 border border-outline/5 rounded-xl px-4 py-3 text-sm text-on-surface-variant/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-on-surface block">Avatar Identity</label>
                  <div className="flex flex-wrap gap-4">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`flex items-center gap-3 p-3 pr-4 rounded-xl border transition-all ${
                          editAvatar === av.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' 
                            : 'border-outline/10 bg-surface hover:border-outline/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${av.color}`}>
                          <av.icon size={20} />
                        </div>
                        <span className={`text-sm font-semibold ${editAvatar === av.id ? 'text-primary' : 'text-on-surface'}`}>
                          {av.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Academic Details */}
              <section className="space-y-6 pt-6 border-t border-outline/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">Academic Profile</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface block">Current Standard</label>
                  <div className="flex flex-wrap gap-3">
                    {['Class 11', 'Class 12', 'Dropper', 'Class 10'].map(cls => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setEditClass(cls)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                          editClass === cls 
                            ? 'bg-on-surface text-surface border-on-surface shadow-sm' 
                            : 'bg-surface text-on-surface border-outline/10 hover:border-outline/30'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface block">Daily Study Goal</label>
                  <div className="flex flex-wrap gap-3">
                    {['15 mins', '30 mins', '60 mins', '120 mins'].map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setEditGoal(goal)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                          editGoal === goal 
                            ? 'bg-on-surface text-surface border-on-surface shadow-sm' 
                            : 'bg-surface text-on-surface border-outline/10 hover:border-outline/30'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Status Messages */}
              {errorMsg && (
                <div className="p-4 bg-error/10 text-error rounded-xl text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error" />
                  {errorMsg}
                </div>
              )}

              {saveSuccess && (
                <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <IconCheck size={18} />
                  Profile updated successfully!
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-outline/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-on-primary font-bold px-8 py-3 rounded-xl transition-opacity shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
