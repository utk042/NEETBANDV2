import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import StatsSection from '../components/StatsSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import StickyPlayer from '../components/StickyPlayer';
import MobilePlayer from '../components/MobilePlayer';
import FullPlayerModal from '../components/FullPlayerModal';
import PremiumModal from '../components/PremiumModal';
import MobileNavbar from '../components/MobileNavbar';
import FAQ from '../components/FAQ';
import LoadingScreen from '../components/LoadingScreen';
import { lazyWithRetry } from '../utils/lazyWithRetry';
const Dashboard = lazyWithRetry(() => import('../components/Dashboard'));
const Favourites = lazyWithRetry(() => import('../components/Favourites'));
const StudentHub = lazyWithRetry(() => import('../components/StudentHub'));
const Blog = lazyWithRetry(() => import('../components/Blog'));
const AboutUs = lazyWithRetry(() => import('../components/AboutUs'));
const ContactUs = lazyWithRetry(() => import('../components/ContactUs'));
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import useScrollAnimations from '../hooks/useScrollAnimations';
const LoginSignup = lazyWithRetry(() => import('../components/LoginSignup'));
const AuthCallback = lazyWithRetry(() => import('../components/AuthCallback'));
const ResetPassword = lazyWithRetry(() => import('../components/ResetPassword'));
import SyllabusLibrary from '../components/SyllabusLibrary';
const LibraryPage = lazyWithRetry(() => import('../components/LibraryPage'));
const SongLibrary = lazyWithRetry(() => import('../components/SongLibrary'));
import GoToTop from '../components/GoToTop';
import ProtectedRoute from '../components/ProtectedRoute';
const CommunityForum = lazyWithRetry(() => import('../components/CommunityForum'));
const CoursePlayer = lazyWithRetry(() => import('../components/CoursePlayer'));
const Checkout = lazyWithRetry(() => import('../components/Checkout'));
import NotFound from '../components/NotFound';
import TermsAndConditions from '../components/TermsAndConditions';
import DataPolicy from '../components/DataPolicy';
import RefundPolicy from '../components/RefundPolicy';
const BookOfferPreview = lazyWithRetry(() => import('../components/Offers/BookOfferPreview'));
const EyeCheckupOffer = lazyWithRetry(() => import('../components/Offers/EyeCheckupOffer'));
import { getCourses } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';
import { usePlayer } from '../contexts/PlayerContext';

function FeedGuard({ user, isAuthLoading, setPostLoginRedirect }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !user.isLoggedIn) {
        setPostLoginRedirect('feed');
        navigate('/login', { replace: true });
      } else if (!user.isPremium && user.role !== 'admin' && user.role !== 'owner') {
        alert("Premium access required. Redirecting to checkout...");
        navigate('/checkout', { replace: true });
      }
    }
  }, [user, isAuthLoading, navigate, setPostLoginRedirect]);

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
  const currentPage = location.pathname === '/' ? 'home' : location.pathname.split('/')[1] || 'home';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isCourseItemView = pathSegments[0] === 'course' && pathSegments.length > 2;
  const hideHeader = ['login', 'checkout'].includes(currentPage) || isCourseItemView;

  // Player state from context
  const {
    currentTrack, isPlaying, currentTime, queue, setQueue, isMuted, setIsMuted,
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
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
  }, [currentPage]);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpgradeClick = () => {
    if (!user || !user.isLoggedIn) {
      setPostLoginRedirect('checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  // Wrap handleTrackSelect with premium guard
  const handleTrackSelect = (track) => {
    if (track.premium && !user?.isPremium) {
      handleUpgradeClick();
      return;
    }
    contextHandleTrackSelect(track);
  };

  // Wrap togglePlay with premium guard
  const togglePlay = () => {
    if (currentTrack?.premium && !user?.isPremium) {
      handleUpgradeClick();
      return;
    }
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
              <Hero currentTrack={currentTrack} isPlaying={isPlaying} togglePlay={togglePlay} onUpgradeClick={handleUpgradeClick} />
              <SyllabusLibrary tracks={globalTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onSeek={handleSeek} />
              <Features />
              <StatsSection appReady={!isLoading} />
              <Pricing onUpgrade={handleUpgradeClick} user={user} />
              <FAQ />
            </>} />

            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Dashboard" loginRoute="/login">
                <Dashboard navigate={navigate} onLogout={logout} tracks={globalTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} user={user} setUser={login} recentlyPlayedTrackIds={recentlyPlayedTrackIds} />
              </ProtectedRoute>
            } />
            
            <Route path="/offers/book" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Offers" loginRoute="/login">
                <BookOfferPreview />
              </ProtectedRoute>
            } />

            <Route path="/offers/eye-checkup" element={
              <ProtectedRoute isLoggedIn={user?.isLoggedIn} isAuthLoading={isAuthLoading} portalName="Offers" loginRoute="/login">
                <EyeCheckupOffer />
              </ProtectedRoute>
            } />
            
            <Route path="/favourites" element={<div className="pt-32 pb-32"><Favourites tracks={globalTracks} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} /></div>} />

            <Route path="/course" element={<LibraryPage tracks={globalTracks} lmsCourses={lmsCourses} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} onCourseSelect={async (course) => {
                try {
                  const freshCourses = await getCourses();
                  setLmsCourses(freshCourses);
                } catch (err) {
                  console.error("Failed to fetch fresh course details:", err);
                }
                navigate(`/course/${course._id}`);
              }} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onUpgradeClick={handleUpgradeClick} queue={queue} setQueue={setQueue} handleNext={handleNext} handlePrev={handlePrev} handleSeek={handleSeek} />} />

            <Route path="/course/:courseId" element={<CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />} />
            <Route path="/course/:courseId/:itemType/:lessonIdx/:itemIdx" element={<CoursePlayer currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />} />
            <Route path="/course-player" element={<Navigate to="/course" replace />} />

            <Route path="/hub" element={<div className="pt-32 pb-32"><StudentHub /></div>} />
            <Route path="/library" element={<SongLibrary tracks={globalTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} />} />
            <Route path="/feed" element={<FeedGuard user={user} isAuthLoading={isAuthLoading} setPostLoginRedirect={setPostLoginRedirect} />} />
            <Route path="/blog" element={<Blog user={user} />} />
            <Route path="/blog/:slug" element={<Blog user={user} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<DataPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />

            <Route path="/login" element={<LoginSignup onLoginSuccess={(sessionUser) => {
                login(sessionUser);
                if (postLoginRedirect) {
                  navigate(`/${postLoginRedirect}`);
                  setPostLoginRedirect(null);
                } else {
                  navigate('/dashboard');
                }
              }} navigate={navigate} />} />

            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            <Route path="/checkout" element={<Checkout user={user} navigate={navigate} onCheckoutSuccess={(updatedUser) => {
                login(updatedUser);
                localStorage.setItem('neetband_current_user', JSON.stringify(updatedUser));
                navigate('/dashboard');
              }} />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </main>

      {['home', 'blog', 'about', 'contact', 'terms', 'privacy', 'refund'].includes(currentPage) && (
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

      <PWAInstallPrompt />

      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      
      <FullPlayerModal isOpen={isFullPlayerOpen} onClose={() => setIsFullPlayerOpen(false)} />

      <GoToTop currentPage={currentPage} />
    </>
  );
}
