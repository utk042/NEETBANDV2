import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import StatsSection from '../components/StatsSection';
import WhatIsNeetBand from '../components/WhatIsNeetBand';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import StickyPlayer from '../components/StickyPlayer';
import MobilePlayer from '../components/MobilePlayer';
import FullPlayerModal from '../components/FullPlayerModal';
import PremiumModal from '../components/PremiumModal';
import MobileNavbar from '../components/MobileNavbar';
import FAQ from '../components/FAQ';
import PartnerScroller from '../components/PartnerScroller';
import ErrorReport from '../components/ErrorReport';
import LoadingScreen from '../components/LoadingScreen';
import { lazyWithRetry } from '../utils/lazyWithRetry';
const Dashboard = lazyWithRetry(() => import('../components/Dashboard'));
const Favourites = lazyWithRetry(() => import('../components/Favourites'));
const StudentHub = lazyWithRetry(() => import('../components/StudentHub'));
const Blog = lazyWithRetry(() => import('../components/Blog'));
const AboutUs = lazyWithRetry(() => import('../components/AboutUs'));
const ContactUs = lazyWithRetry(() => import('../components/ContactUs'));

import useScrollAnimations from '../hooks/useScrollAnimations';
import useSeoHead from '../hooks/useSeoHead';
const LoginSignup = lazyWithRetry(() => import('../components/LoginSignup'));
const AuthCallback = lazyWithRetry(() => import('../components/AuthCallback'));
const ResetPassword = lazyWithRetry(() => import('../components/ResetPassword'));
import SyllabusLibrary from '../components/SyllabusLibrary';
import CourseCarousel from '../components/CourseCarousel';
const LibraryPage = lazyWithRetry(() => import('../components/LibraryPage'));
const SongLibrary = lazyWithRetry(() => import('../components/SongLibrary'));
import GoToTop from '../components/GoToTop';
import FollowUsSidebar from '../components/FollowUsSidebar';
import ProtectedRoute, { PublicOnlyRoute } from '../components/ProtectedRoute';
const CommunityForum = lazyWithRetry(() => import('../components/CommunityForum'));
const CoursePlayer = lazyWithRetry(() => import('../components/CoursePlayer'));
const Checkout = lazyWithRetry(() => import('../components/Checkout'));
import NotFound from '../components/NotFound';
import TermsAndConditions from '../components/TermsAndConditions';
import DataPolicy from '../components/DataPolicy';
import RefundPolicy from '../components/RefundPolicy';
import Careers from '../components/Careers';
import Advertise from '../components/Advertise';
import Partner from '../components/Partner';
const BookOfferPreview = lazyWithRetry(() => import('../components/Offers/BookOfferPreview'));
const BookCheckout = lazyWithRetry(() => import('../components/Offers/BookCheckout'));
const EyeCheckupOffer = lazyWithRetry(() => import('../components/Offers/EyeCheckupOffer'));
const MemberBenefits = lazyWithRetry(() => import('../components/MemberBenefits'));
const PricingPage = lazyWithRetry(() => import('../components/PricingPage'));
const ReceiptPage = lazyWithRetry(() => import('../components/ReceiptPage'));
import VideoReviewsGallery from '../components/VideoReviewsGallery';
import TextTestimonials from '../components/TextTestimonials';
import { getCourses } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useDialog } from '../contexts/DialogContext';

function FeedGuard({ user, isAuthLoading, setPostLoginRedirect }) {
  const navigate = useNavigate();
  const { alert: dialogAlert } = useDialog();
  
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !user.isLoggedIn) {
        setPostLoginRedirect('feed');
        navigate('/login', { replace: true });
      } else if (!user.isPremium && user.role !== 'admin' && user.role !== 'owner') {
        dialogAlert("Premium Required", "Premium access required. Redirecting to pricing plans...").then(() => {
          navigate('/pricing', { replace: true });
        }).catch(() => {
          navigate('/pricing', { replace: true });
        });
      }
    }
  }, [user, isAuthLoading, navigate, setPostLoginRedirect, dialogAlert]);

  if (isAuthLoading || !user || !user.isLoggedIn || (!user.isPremium && user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return <CommunityForum user={user} />;
}

export default function UserRoutes() {
  const { user, isAuthLoading, login, logout } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic SEO, GEO & AEO metadata management
  useSeoHead();
  const currentPage = location.pathname === '/' ? 'home' : location.pathname.split('/')[1] || 'home';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isCourseItemView = pathSegments[0] === 'course' && pathSegments.length > 2;
  const hideHeader = ['login', 'checkout'].includes(currentPage) || isCourseItemView;

  // Player state from context
  const {
    currentTrack, isPlaying, isAnyAudioActive, currentTime, queue, setQueue, isMuted, setIsMuted,
    favoritedTrackIds, recentlyPlayedTrackIds,
    togglePlay: contextTogglePlay, handleTrackSelect: contextHandleTrackSelect,
    handleNext, handlePrev, handleSeek,
    toggleFavorite: handleToggleFavorite,
    globalTracks, setGlobalTracks,
  } = usePlayer();

  const [lmsCourses, setLmsCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useScrollAnimations(!isLoading);

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  
  useEffect(() => {
    getCourses()
      .then(data => setLmsCourses(data))
      .catch(err => console.error('Failed to fetch courses:', err));
  }, []); // fetch once on mount, not on every page change

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  // Track selection & toggle (playback behavior is managed by PlayerContext according to user tier & songType)
  const handleTrackSelect = (track) => {
    contextHandleTrackSelect(track);
  };

  const togglePlay = () => {
    contextTogglePlay();
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      {!hideHeader && (
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentPage={currentPage} 
          navigate={navigate} 
          user={user}
          onLogout={() => {
            logout();
            navigate('/');
          }}
        />
      )}
      
      <main>
        <React.Suspense fallback={
          <div className="min-h-[60vh] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<>
              <Hero currentTrack={currentTrack} isPlaying={isAnyAudioActive} togglePlay={togglePlay} onUpgradeClick={handleUpgradeClick} />
              <SyllabusLibrary tracks={globalTracks} currentTrack={currentTrack} isPlaying={isAnyAudioActive} onTrackSelect={handleTrackSelect} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onSeek={handleSeek} />
              <CourseCarousel lmsCourses={lmsCourses} />
              <ErrorReport />
              <Features />
              <VideoReviewsGallery />
              <TextTestimonials />
              <StatsSection appReady={!isLoading} />
              <WhatIsNeetBand />
              <Pricing onUpgrade={handleUpgradeClick} onSelectPlan={(planId) => navigate(`/checkout?plan=${planId}&billing=yearly`)} user={user} />
              <div className="mt-8">
                <PartnerScroller />
              </div>
              <FAQ pageName="homepage" />
            </>} />

            <Route path="/pricing" element={<PricingPage user={user} navigate={navigate} />} />

            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Dashboard" loginRoute="/login">
                <Dashboard navigate={navigate} onLogout={logout} tracks={globalTracks} currentTrack={currentTrack} isPlaying={isAnyAudioActive} onTrackSelect={handleTrackSelect} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} user={user} setUser={login} recentlyPlayedTrackIds={recentlyPlayedTrackIds} onUpgradeClick={() => setIsPremiumModalOpen(true)} />
              </ProtectedRoute>
            } />
            
            <Route path="/offers/book" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Offers" loginRoute="/login">
                <BookOfferPreview />
              </ProtectedRoute>
            } />

            <Route path="/offers/book/checkout" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Offers" loginRoute="/login">
                <BookCheckout />
              </ProtectedRoute>
            } />

            <Route path="/offers/eye-checkup" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Offers" loginRoute="/login">
                <EyeCheckupOffer />
              </ProtectedRoute>
            } />
            
            <Route path="/favourites" element={<div className="pt-36 md:pt-44 pb-32"><Favourites tracks={globalTracks} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} currentTrack={currentTrack} isPlaying={isAnyAudioActive} onTrackSelect={handleTrackSelect} /></div>} />

            <Route path="/course" element={<LibraryPage tracks={globalTracks} lmsCourses={lmsCourses} currentTrack={currentTrack} isPlaying={isAnyAudioActive} onTrackSelect={handleTrackSelect} onCourseSelect={async (course) => {
                try {
                  const freshCourses = await getCourses();
                  setLmsCourses(freshCourses);
                } catch (err) {
                  console.error("Failed to fetch fresh course details:", err);
                }
                navigate(`/course/${course._id}`);
              }} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onUpgradeClick={handleUpgradeClick} queue={queue} setQueue={setQueue} handleNext={handleNext} handlePrev={handlePrev} handleSeek={handleSeek} />} />

            <Route path="/course/:courseId" element={
              <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
            } />
            <Route path="/course/:courseId/:itemType/:subjectIdx/:chapterIdx/:itemIdx" element={
              <CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />
            } />
            <Route path="/course-player" element={<Navigate to="/course" replace />} />

            <Route path="/hub" element={<div className="pt-36 md:pt-44 pb-32"><StudentHub user={user} onUpgradeClick={() => setIsPremiumModalOpen(true)} /></div>} />
            <Route path="/benefits" element={<MemberBenefits user={user} onUpgradeClick={handleUpgradeClick} />} />
            <Route path="/library" element={<div className="pt-36 md:pt-44"><SyllabusLibrary tracks={globalTracks} currentTrack={currentTrack} isPlaying={isAnyAudioActive} onTrackSelect={handleTrackSelect} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onSeek={handleSeek} /></div>} />
            <Route path="/feed" element={<Navigate to="/dashboard?tab=feed" replace />} />
            <Route path="/blog" element={<Blog user={user} />} />
            <Route path="/blog/:slug" element={<Blog user={user} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<DataPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/partner" element={<Partner />} />

            <Route path="/login" element={
              <PublicOnlyRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} redirectTo="/dashboard">
                <LoginSignup onLoginSuccess={(sessionUser) => {
                    login(sessionUser);
                    if (postLoginRedirect) {
                      navigate(`/${postLoginRedirect}`);
                      setPostLoginRedirect(null);
                    } else if (location.state?.from?.pathname) {
                      navigate(location.state.from.pathname);
                    } else {
                      navigate('/dashboard');
                    }
                  }} navigate={navigate} />
              </PublicOnlyRoute>
            } />

            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            <Route path="/checkout" element={<Checkout user={user} navigate={navigate} onCheckoutSuccess={(updatedUser) => {
                login(updatedUser);
                localStorage.setItem('neetband_current_user', JSON.stringify(updatedUser));
              }} />} />

            <Route path="/receipt/:id" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Receipt" loginRoute="/login">
                <ReceiptPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </main>

      {['home', 'pricing', 'blog', 'about', 'contact', 'terms', 'privacy', 'refund', 'benefits', 'careers', 'advertise', 'partner'].includes(currentPage) && (
        <div className={currentPage !== 'home' ? 'hidden md:block' : ''}>
          <Footer navigate={navigate} />
        </div>
      )}

      {!['login', 'checkout'].includes(currentPage) && (
        <>
          <StickyPlayer onOpenFullPlayer={() => setIsFullPlayerOpen(true)} />
          <MobilePlayer onOpenFullPlayer={() => setIsFullPlayerOpen(true)} />
        </>
      )}

      {!['login', 'checkout'].includes(currentPage) && <MobileNavbar currentPage={currentPage} navigate={navigate} user={user} />}
      {!['login', 'checkout'].includes(currentPage) && <FollowUsSidebar />}


      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgrade={() => { setIsPremiumModalOpen(false); handleUpgradeClick(); }} />
      
      <FullPlayerModal isOpen={isFullPlayerOpen} onClose={() => setIsFullPlayerOpen(false)} />

      <GoToTop currentPage={currentPage} />
    </>
  );
}
