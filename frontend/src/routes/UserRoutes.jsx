import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const Favourites = React.lazy(() => import('../components/Favourites'));
const StudentHub = React.lazy(() => import('../components/StudentHub'));
const Blog = React.lazy(() => import('../components/Blog'));
const AboutUs = React.lazy(() => import('../components/AboutUs'));
const ContactUs = React.lazy(() => import('../components/ContactUs'));
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import useScrollAnimations from '../hooks/useScrollAnimations';
const LoginSignup = React.lazy(() => import('../components/LoginSignup'));
const AuthCallback = React.lazy(() => import('../components/AuthCallback'));
const ResetPassword = React.lazy(() => import('../components/ResetPassword'));
import SyllabusLibrary from '../components/SyllabusLibrary';
const LibraryPage = React.lazy(() => import('../components/LibraryPage'));
const SongLibrary = React.lazy(() => import('../components/SongLibrary'));
import GoToTop from '../components/GoToTop';
import ProtectedRoute from '../components/ProtectedRoute';
const CommunityForum = React.lazy(() => import('../components/CommunityForum'));
const CoursePlayer = React.lazy(() => import('../components/CoursePlayer'));
const Checkout = React.lazy(() => import('../components/Checkout'));
import NotFound from '../components/NotFound';
import TermsAndConditions from '../components/TermsAndConditions';
import DataPolicy from '../components/DataPolicy';
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
  
  const [activeCourse, setActiveCourse] = useState(() => {
    try {
      const stored = localStorage.getItem('neetband_active_course');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (activeCourse) {
      localStorage.setItem('neetband_active_course', JSON.stringify(activeCourse));
    } else {
      localStorage.removeItem('neetband_active_course');
    }
  }, [activeCourse]);

  useEffect(() => {
    if (activeCourse && lmsCourses.length > 0) {
      const fresh = lmsCourses.find(c => c._id === activeCourse._id);
      if (fresh) {
        setActiveCourse(fresh);
      }
    }
  }, [lmsCourses]);

  const [coursePlayerView, setCoursePlayerView] = useState('overview');

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
      
      {!['login', 'checkout'].includes(currentPage) && !(currentPage === 'course-player' && coursePlayerView === 'lesson') && (
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
            
            <Route path="/favourites" element={<div className="pt-32 pb-32"><Favourites tracks={globalTracks} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} /></div>} />

            <Route path="/course" element={<LibraryPage tracks={globalTracks} lmsCourses={lmsCourses} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} onCourseSelect={async (course) => {
                try {
                  const freshCourses = await getCourses();
                  setLmsCourses(freshCourses);
                  const freshCourse = freshCourses.find(c => c._id === course._id);
                  setActiveCourse(freshCourse || course);
                } catch (err) {
                  console.error("Failed to fetch fresh course details:", err);
                  setActiveCourse(course);
                }
                navigate('/course-player');
              }} currentTime={currentTime} favoritedTrackIds={favoritedTrackIds} onToggleFavorite={handleToggleFavorite} onUpgradeClick={handleUpgradeClick} queue={queue} setQueue={setQueue} handleNext={handleNext} handlePrev={handlePrev} handleSeek={handleSeek} />} />

            <Route path="/course-player" element={<CoursePlayer course={activeCourse} onBack={() => navigate('/course')} onViewChange={setCoursePlayerView} navigate={navigate} currentTrack={currentTrack} user={user} onUpgradeClick={handleUpgradeClick} />} />

            <Route path="/hub" element={<div className="pt-32 pb-32"><StudentHub /></div>} />
            <Route path="/library" element={<SongLibrary tracks={globalTracks} currentTrack={currentTrack} isPlaying={isPlaying} onTrackSelect={handleTrackSelect} />} />
            <Route path="/feed" element={<FeedGuard user={user} isAuthLoading={isAuthLoading} setPostLoginRedirect={setPostLoginRedirect} />} />
            <Route path="/blog" element={<Blog user={user} />} />
            <Route path="/blog/:slug" element={<Blog user={user} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<DataPolicy />} />

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

      {['home', 'blog', 'about', 'contact', 'terms', 'privacy'].includes(currentPage) && (
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
