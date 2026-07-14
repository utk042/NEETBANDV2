import React, { useState, useEffect } from 'react';

import { 
  IconUser, IconHeart, IconBrain, IconBell, 
  IconFlame, IconClock, IconLogout, IconArrowRight, 
  IconCheck, IconChevronRight, IconBook, IconSchool,
  IconAward, IconPlayerPlayFilled, IconBookmark, IconTrendingUp,
  IconCertificate, IconX, IconPencil, IconCrown, IconEye, IconShoppingCart
} from '@tabler/icons-react';
import { getUserProfile, uploadFile, updateUserProfile } from '../services/api';
import Button from './ui/Button';
import { Card, CardHeader, CardBody } from './ui/Card';




export default function Dashboard({ 
  navigate, 
  onLogout,
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Form states
  const [profileData, setProfileData] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
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
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (isProfileModalOpen && user) {
      setProfileFile(null);
      setPreviewUrl(prev => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return user.profilePicture ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`) : '';
      });
    }
    return () => {
      setPreviewUrl(prev => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return '';
      });
    };
  }, [isProfileModalOpen, user]);

  useEffect(() => {
    setEditName(user?.name || '');
    setEditClass(user?.class || 'Class 12');
    setEditPrefs(user?.preferences || ['Biology', 'Chemistry']);
    setEditGoal(user?.studyGoal || '30 mins');
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg('Full name cannot be empty');
      return;
    }
    
    setErrorMsg(null);
    setSaveSuccess(false);

    let uploadedUrl = user?.profilePicture || '';
    if (profileFile) {
      try {
        const uploadRes = await uploadFile(profileFile, 'profile_pictures');
        uploadedUrl = uploadRes.url;
      } catch (err) {
        setErrorMsg('Failed to upload profile picture');
        return;
      }
    }

    try {
      const dbUpdated = await updateUserProfile({
        name: editName,
        profilePicture: uploadedUrl
      });
      uploadedUrl = dbUpdated.profilePicture || uploadedUrl;
    } catch (err) {
      setErrorMsg('Failed to save profile to database');
      return;
    }

    const updatedUser = {
      ...user,
      name: editName,
      profilePicture: uploadedUrl,
      class: editClass,
      preferences: editPrefs,
      studyGoal: editGoal
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
        profilePicture: uploadedUrl,
        class: editClass,
        preferences: editPrefs,
        studyGoal: editGoal
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
    setIsLogoutModalOpen(true);
  };

  const confirmLogoutAction = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('neetband_current_user');
      localStorage.removeItem('user_token');
      setUser({ isLoggedIn: false, name: '', email: '' });
    }
    navigate('/');
  };

  // Get favorite tracks data
  const favoriteTracksList = tracks.filter(t => favoritedTrackIds?.includes(t.id));

  // Get recently played tracks data
  const recentTracksList = (recentlyPlayedTrackIds || []).map(id => tracks.find(t => t.id === id)).filter(Boolean);

  // Generate a nice avatar URL based on the user's name using Dicebear
  const avatarUrl = user?.profilePicture 
    ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${API_URL}${user.profilePicture}`)
    : `https://api.dicebear.com/9.x/avataaars/svg?seed=${profileName || 'Student'}&backgroundColor=b6e3f4`;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-32 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient orbs — matches site-wide style */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.06] bg-primary pointer-events-none" />
      <div className="absolute top-[20%] left-[-8%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.04] bg-primary pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 mt-12">
        <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-20">
            <div className="flex items-center gap-6 max-w-2xl">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-outline/10 shadow-md shrink-0 bg-surface-variant flex items-center justify-center">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-display-1 text-on-surface mb-2">
                  Welcome back, {(profileName || 'Student').split(' ')[0]}.
                </h1>
                <p className="text-xl md:text-2xl font-medium text-on-surface-variant leading-relaxed">
                  Your daily goal is <span className="text-on-surface border-b border-primary/50 pb-1">{editGoal || '30 mins'}</span>. Let's make this session count.
                </p>
              </div>
            </div>
            
            <Button variant="secondary" onClick={() => setIsProfileModalOpen(true)} className="self-start px-6 py-4">
              <IconPencil size={20} className="mr-2" /> Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 mb-24 border-t border-b border-outline/10 divide-y md:divide-y-0 md:divide-x divide-outline/10">
            <div className="flex flex-col gap-4 py-12 md:py-16 md:px-12 first:md:pl-0 last:md:pr-0">
              <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2">
                <IconHeart size={16} className="text-primary" /> Saved Tracks
              </span>
              <span className="text-7xl lg:text-[110px] font-extrabold tracking-tighter leading-none text-on-surface">{favoriteTracksList.length}</span>
            </div>
            <div className="flex flex-col gap-4 py-12 md:py-16 md:px-12 first:md:pl-0 last:md:pr-0">
              <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2">
                <IconClock size={16} className="text-primary" /> Goal Progress
              </span>
              <span className="text-7xl lg:text-[110px] font-extrabold tracking-tighter leading-none text-on-surface">
                0
                <span className="text-4xl lg:text-6xl text-primary font-bold">
                  /{(editGoal || '30 mins').replace(' mins', '')}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-4 py-12 md:py-16 md:px-12 first:md:pl-0 last:md:pr-0">
              <span className="text-xs font-bold tracking-[0.2em] text-on-surface-variant uppercase flex items-center gap-2">
                <IconFlame size={16} className="text-primary" /> Study Streak
              </span>
              <span className="text-7xl lg:text-[110px] font-extrabold tracking-tighter leading-none text-on-surface">{profileData?.streak || 0}</span>
            </div>
          </div>

          {/* PREMIUM OFFERS */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-6 flex items-center gap-2">
              <IconAward className="text-primary" size={28} strokeWidth={1.5} /> Exclusive Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Book Offer */}
              <Card className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-300">
                <CardBody className="p-6 flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 shadow-inner border border-amber-500/20">
                    <IconBook size={24} strokeWidth={1.5} />
                  </div>
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-600 mb-3 inline-block">
                      50% OFF
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">NeetBand Mastery Guide</h3>
                  <p className="text-sm text-on-surface-variant mb-6 flex-1">
                    Get the ultimate study guide written by our top authors. Claim your 50% discount and master the syllabus faster.
                  </p>
                  <Button 
                    onClick={() => {
                      if (!user?.isPremium) {
                        setIsPremiumModalOpen(true);
                      } else {
                        navigate('/offers/book');
                      }
                    }} 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 text-sm"
                  >
                    <IconShoppingCart size={18} className="mr-2" /> Claim Offer
                  </Button>
                </CardBody>
              </Card>

              {/* Eye Checkup Offer */}
              <Card className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-300">
                <CardBody className="p-6 flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 shadow-inner border border-emerald-500/20">
                    <IconEye size={24} strokeWidth={1.5} />
                  </div>
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-emerald-500/30 rounded-full bg-emerald-500/10 text-emerald-600 mb-3 inline-block">
                      FREE
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Free Eye Checkup</h3>
                  <p className="text-sm text-on-surface-variant mb-6 flex-1">
                    Protect your vision while studying. Premium members can book a free comprehensive eye checkup at our partner clinics.
                  </p>
                  <Button 
                    onClick={() => {
                      if (!user?.isPremium) {
                        setIsPremiumModalOpen(true);
                      } else {
                        navigate('/offers/eye-checkup');
                      }
                    }} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 text-sm"
                  >
                    <IconCheck size={18} className="mr-2" /> Book Now
                  </Button>
                </CardBody>
              </Card>

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
                    <Card key={index} className="flex flex-col justify-between group h-full hover:-translate-y-1 transition-all duration-300">
                      <CardBody className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-xs font-bold text-on-surface uppercase tracking-widest px-3 py-1.5 border border-outline/20 rounded-full bg-surface-container-high/50">
                            {course.subject || 'Course'}
                          </span>
                          <span className="text-2xl font-extrabold text-on-surface">{percentage}%</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4 leading-tight">{course.title}</h3>
                        <p className="text-lg font-medium text-on-surface-variant line-clamp-2">
                          {course.summary || 'Continue learning this course.'}
                        </p>
                      </CardBody>
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2">
                        <div className="w-full h-2 bg-surface-container-high overflow-hidden rounded-full border border-outline/10">
                          <div 
                            className="h-full bg-primary expand-width-anim" 
                            style={{ 
                              '--target-width': `${percentage}%`,
                              width: `${percentage}%` 
                            }} 
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-[32px] p-8 text-center border border-outline/10">
                <p className="text-on-surface-variant">You are not enrolled in any courses yet.</p>
              </div>
            )}
          </div>

          <div className="mb-24">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-8 flex items-center gap-2">
              <IconCertificate className="text-primary" size={28} strokeWidth={1.5} /> Your Subscription
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <Card className="flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                <CardBody className="p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 border border-outline/20 rounded-full bg-surface-container-high/50 ${user?.isPremium ? 'text-primary' : 'text-on-surface'}`}>
                      {user?.isPremium ? 'Active Plan' : 'Free Tier'}
                    </span>
                    {user?.isPremium && (
                      <span className="flex items-center gap-1 text-sm font-bold text-emerald-500 uppercase tracking-widest">
                        <IconCheck size={18} strokeWidth={1.5} /> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 flex items-center gap-3">
                    {user?.isPremium ? 'Premium Scholar' : 'Basic Listener'}
                    {user?.isPremium && <IconCrown className="text-primary" size={40} />}
                  </h3>
                  <p className="text-xl font-medium text-on-surface-variant max-w-xl leading-relaxed">
                    {user?.isPremium 
                      ? "You have full access to all premium tracks, offline downloads, and ad-free listening. Enjoy the full NeetBand experience!"
                      : "You are currently on the free plan. Upgrade to access all 2000+ songs, premium quizzes, and offline downloads."}
                  </p>
                </CardBody>
                
                <div className="shrink-0 flex flex-col items-start md:items-end gap-4 px-8 pb-8 md:p-12">
                  {!user?.isPremium ? (
                    <Button onClick={() => navigate('/pricing')} size="lg" className="w-full md:w-auto">
                      Upgrade to Premium
                    </Button>
                  ) : (
                    <div className="text-left md:text-right">
                      <p className="text-sm font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Membership Plan</p>
                      <p className="text-3xl font-extrabold text-on-surface capitalize">{user?.membershipPlan?.replace('_', ' ') || 'Premium'}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>


          {/* Favourites & Recently Played */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Favourites Widget */}
            <Card className="flex flex-col h-full">
              <CardBody className="p-8 md:p-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Your Favourites</h2>
                {favoriteTracksList.length > 0 && (
                  <button 
                    onClick={() => navigate('/library')}
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
                    onClick={() => navigate('/library')}
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
                          <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" loading="lazy" />
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
              </CardBody>
            </Card>

            {/* Recently Played Widget */}
            <Card className="flex flex-col h-full">
              <CardBody className="p-8 md:p-10 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Recently Played</h2>
                {recentTracksList.length > 0 && (
                  <button 
                    onClick={() => navigate('/library')}
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
                    onClick={() => navigate('/library')}
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
                          <img src={track.cover || track.image} alt="" className="w-full h-full object-cover" loading="lazy" />
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
              </CardBody>
            </Card>

          </div>
          
          {/* Logout Button at the bottom */}
          <div className="flex justify-center mt-16 mb-8">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-red-500 border border-red-500/10 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <IconLogout size={20} strokeWidth={1.5} className="mr-2" /> Log Out
            </Button>
          </div>

        </div>
      </div>

      {/* ── Profile Edit Modal ── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center px-4">
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
              
              {/* Profile Picture Uploader */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-variant flex items-center justify-center text-on-surface-variant shadow-md">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold uppercase">{editName.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onClick={(e) => { e.target.value = null; }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileFile(file);
                          setPreviewUrl(prev => {
                            if (prev && prev.startsWith('blob:')) {
                              URL.revokeObjectURL(prev);
                            }
                            return URL.createObjectURL(file);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-on-surface-variant/60">Click to upload JPG, PNG, or GIF</p>
              </div>

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
              </section>

              {/* Academic Details */}
              <section className="space-y-6 pt-6 border-t border-outline/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">Academic Profile</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface block">Current Standard</label>
                  <div className="flex flex-wrap gap-3">
                    {['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
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

      {/* ── Logout Confirmation Modal ── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-surface/85 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsLogoutModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface-container-low rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-outline/10 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 text-red-500">
              <IconLogout size={32} strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2">Confirm Log Out</h2>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              Are you sure you want to log out of NeetBand? You will need to verify your email or sign in again to access your playlist and MCQ progress.
            </p>

            <div className="flex justify-center gap-4 w-full">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors border border-outline/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogoutAction}
                className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Yes, Log Out
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
