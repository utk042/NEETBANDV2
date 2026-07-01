import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import StatsSection from './components/StatsSection';
import Pricing from './components/Pricing';

import Footer from './components/Footer';
import StickyPlayer from './components/StickyPlayer';
import MobilePlayer from './components/MobilePlayer';
import FullPlayerModal from './components/FullPlayerModal';
import PremiumModal from './components/PremiumModal';
import MobileNavbar from './components/MobileNavbar';
import FAQ from './components/FAQ';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './components/Dashboard';
import Favourites from './components/Favourites';
import StudentHub from './components/StudentHub';
import Blog from './components/Blog';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import useScrollAnimations from './hooks/useScrollAnimations';
import LoginSignup from './components/LoginSignup';
import SyllabusLibrary from './components/SyllabusLibrary';
import LibraryPage from './components/LibraryPage';
import SongLibrary from './components/SongLibrary';
import CustomCursor from './components/CustomCursor';
import GoToTop from './components/GoToTop';
import CommunityForum from './components/CommunityForum';
import CoursePlayer from './components/CoursePlayer';
import AdminDashboard from './components/Admin/AdminDashboard';
import LMSLogin from './components/Admin/LMSLogin';
import NotFound from './components/NotFound';
import AffiliateLogin from './components/Affiliate/AffiliateLogin';
import AffiliateDashboard from './components/Affiliate/AffiliateDashboard';
import Checkout from './components/Checkout';
import { getSongs, getCourses, getUserProfile, getLmsUserProfile, getAffiliateUserProfile } from './services/api';

export default function App() {
  const [globalTracks, setGlobalTracks] = useState([]);
  const [lmsCourses, setLmsCourses] = useState([]);
  
  // Valid pages to prevent 404s on weird URLs
  const validPages = ['home', 'dashboard', 'favourites', 'course', 'course-player', 'hub', 'library', 'forum', 'blog', 'about', 'contact', 'login', 'checkout', 'lms', 'lms-login', 'affiliate', 'affiliate-login'];

  // Navigation state
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, ''); // remove leading slash
    if (window.location.pathname.startsWith('/lms')) {
      const stored = localStorage.getItem('neetband_lms_user');
      const token = localStorage.getItem('lms_token');
      if (stored && token) return 'lms';
      return 'lms-login';
    }
    if (window.location.pathname.startsWith('/affiliate')) {
      const stored = localStorage.getItem('neetband_affiliate_user');
      const token = localStorage.getItem('affiliate_token');
      if (stored && token) return 'affiliate';
      return 'affiliate-login';
    }
    if (path === '') return 'home';
    if (validPages.includes(path)) return path;
    return '404';
  });

  // Sync currentPage with URL so each page has its own endpoint
  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (window.location.pathname.startsWith('/lms')) {
        const stored = localStorage.getItem('neetband_lms_user');
        const token = localStorage.getItem('lms_token');
        if (stored && token) setCurrentPage('lms');
        else setCurrentPage('lms-login');
      } else if (window.location.pathname.startsWith('/affiliate')) {
        const stored = localStorage.getItem('neetband_affiliate_user');
        const token = localStorage.getItem('affiliate_token');
        if (stored && token) setCurrentPage('affiliate');
        else setCurrentPage('affiliate-login');
      } else if (path === '') {
        setCurrentPage('home');
      } else if (validPages.includes(path)) {
        setCurrentPage(path);
      } else {
        setCurrentPage('404');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activeCourse, setActiveCourse] = useState(() => {
    try {
      const stored = localStorage.getItem('neetband_active_course');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist activeCourse in localStorage
  useEffect(() => {
    if (activeCourse) {
      localStorage.setItem('neetband_active_course', JSON.stringify(activeCourse));
    } else {
      localStorage.removeItem('neetband_active_course');
    }
  }, [activeCourse]);

  // Sync activeCourse with fresh lmsCourses data when loaded
  useEffect(() => {
    if (activeCourse && lmsCourses.length > 0) {
      const fresh = lmsCourses.find(c => c._id === activeCourse._id);
      if (fresh) {
        setActiveCourse(fresh);
      }
    }
  }, [lmsCourses]);

  const [coursePlayerView, setCoursePlayerView] = useState('overview');

  // Authentication Loading State
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // User Authentication State
  const [user, setUser] = useState({ isLoggedIn: false, name: '', email: '' });

  // LMS User State
  const [lmsUser, setLmsUser] = useState({ isLoggedIn: false, name: '', email: '' });

  // Affiliate User State
  const [affiliateUser, setAffiliateUser] = useState({ isLoggedIn: false, name: '', email: '' });

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsAuthLoading(true);

      const mainToken = localStorage.getItem('user_token');
      if (mainToken) {
        try {
          const profile = await getUserProfile();
          setUser({ ...profile, token: mainToken, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('user_token');
          setUser({ isLoggedIn: false, name: '', email: '' });
        }
      }

      const lmsToken = localStorage.getItem('lms_token');
      if (lmsToken) {
        try {
          const profile = await getLmsUserProfile();
          setLmsUser({ ...profile, token: lmsToken, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('lms_token');
          setLmsUser({ isLoggedIn: false, name: '', email: '' });
        }
      }

      const affToken = localStorage.getItem('affiliate_token');
      if (affToken) {
        try {
          const profile = await getAffiliateUserProfile();
          setAffiliateUser({ ...profile, token: affToken, isLoggedIn: true });
        } catch (e) {
          localStorage.removeItem('affiliate_token');
          setAffiliateUser({ isLoggedIn: false, name: '', email: '' });
        }
      }

      setIsAuthLoading(false);
    };

    fetchProfiles();
  }, []);

  // Favorites state
  const [favoritedTrackIds, setFavoritedTrackIds] = useState([]);

  // Recently Played state
  const [recentlyPlayedTrackIds, setRecentlyPlayedTrackIds] = useState(() => {
    try {
      const stored = localStorage.getItem('neetband_recently_played');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Loading screen state
  const [isLoading, setIsLoading] = useState(true);

  // Activate GSAP scroll animations once loading is done
  useScrollAnimations(!isLoading);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [queue, setQueue] = useState([]);
  const audioRef = useRef(null);

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Redirect state for after login
  const [postLoginRedirect, setPostLoginRedirect] = useState(null);
  
  // Fetch initial data
  useEffect(() => {
    const initFetch = async () => {
      try {
        const data = await getSongs();
        // Map backend properties to expected frontend properties if needed
        const mapped = data.map(s => ({
          ...s,
          id: s._id,
          grade: s.class,
          cover: s.thumbnailUrl || 'https://via.placeholder.com/150',
          durationSeconds: s.duration || 200,
          premium: s.isPremium
        }));
        setGlobalTracks(mapped);
        if (mapped.length > 0) setCurrentTrack(mapped[0]);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      }
    };
    initFetch();
  }, []);

  // Fetch LMS Courses for the Library page
  useEffect(() => {
    getCourses()
      .then(data => setLmsCourses(data))
      .catch(err => console.error('Failed to fetch courses:', err));
  }, [currentPage]);

  // Modals state
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Sync theme to root html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Audio playback sync and mock timer fallback
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      if (currentTrack && currentTrack.audioUrl) {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Audio play failed:", err);
            setIsPlaying(false);
          });
        }
      } else {
        // Fallback to mock timer if no audioUrl
        interval = setInterval(() => {
          setCurrentTime((prev) => {
            if (currentTrack && prev >= currentTrack.durationSeconds) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Update recently played when track changes
  useEffect(() => {
    if (currentTrack) {
      setRecentlyPlayedTrackIds(prev => {
        const filtered = prev.filter(id => id !== currentTrack.id);
        const newRecent = [currentTrack.id, ...filtered].slice(0, 10);
        localStorage.setItem('neetband_recently_played', JSON.stringify(newRecent));
        return newRecent;
      });
    }
  }, [currentTrack]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpgradeClick = () => {
    if (!user || !user.isLoggedIn) {
      setPostLoginRedirect('checkout');
      setCurrentPage('login');
    } else {
      setCurrentPage('checkout');
    }
  };

  const togglePlay = () => {
    if (currentTrack.premium) {
      handleUpgradeClick();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleToggleFavorite = (trackId) => {
    setFavoritedTrackIds((prev) => {
      if (prev.includes(trackId)) {
        return prev.filter(id => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const handleTrackSelect = (track) => {
    if (track.premium) {
      handleUpgradeClick();
      return;
    }
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    const list = queue.length > 0 ? queue : globalTracks;
    const idx = list.findIndex(t => t.id === currentTrack.id);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % list.length;
    const nextTrack = list[nextIdx];
    if (nextTrack.premium) {
      handleUpgradeClick();
      setIsPlaying(false);
    } else {
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  const handlePrev = () => {
    const list = queue.length > 0 ? queue : globalTracks;
    const idx = list.findIndex(t => t.id === currentTrack.id);
    const prevIdx = idx === -1 ? 0 : (idx - 1 + list.length) % list.length;
    const prevTrack = list[prevIdx];
    if (prevTrack.premium) {
      handleUpgradeClick();
      setIsPlaying(false);
    } else {
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
      setCurrentTime(0);
    }
  };

  return (
    <>
      {!['lms', 'lms-login', 'affiliate', 'affiliate-login'].includes(currentPage) && <CustomCursor />}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      {!['login', 'lms-login', 'lms', 'affiliate', 'affiliate-login', 'checkout'].includes(currentPage) && !(currentPage === 'course-player' && coursePlayerView === 'lesson') && (
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          user={user}
          onLogout={() => {
            localStorage.removeItem('neetband_current_user');
            setUser({ isLoggedIn: false, name: '', email: '' });
            setCurrentPage('home');
          }}
        />
      )}
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero 
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              onUpgradeClick={handleUpgradeClick}
            />
            <SyllabusLibrary
              tracks={globalTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={handleTrackSelect}
              currentTime={currentTime}
              favoritedTrackIds={favoritedTrackIds}
              onToggleFavorite={handleToggleFavorite}
            />
            <Features />
            <StatsSection appReady={!isLoading} />
            {/* The landing page section doesn't route to the separate page, it just triggers the checkout flow or redirects to pricing */}
            <Pricing onUpgrade={handleUpgradeClick} user={user} />
            <FAQ />
          </>
        )}

        {currentPage === 'dashboard' && (
          isAuthLoading ? (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Dashboard
            setCurrentPage={setCurrentPage}
            tracks={globalTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            currentTime={currentTime}
            favoritedTrackIds={favoritedTrackIds}
            onToggleFavorite={handleToggleFavorite}
            user={user}
            setUser={setUser}
            recentlyPlayedTrackIds={recentlyPlayedTrackIds}
          />
          )
        )}
        {currentPage === 'favourites' && (
          <div className="pt-32 pb-32">
            <Favourites 
              tracks={globalTracks}
              favoritedTrackIds={favoritedTrackIds}
              onToggleFavorite={handleToggleFavorite}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTrackSelect={handleTrackSelect}
            />
          </div>
        )}

        {currentPage === 'course' && (
          <LibraryPage
            tracks={globalTracks}
            lmsCourses={lmsCourses}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onCourseSelect={async (course) => {
              try {
                const freshCourses = await getCourses();
                setLmsCourses(freshCourses);
                const freshCourse = freshCourses.find(c => c._id === course._id);
                setActiveCourse(freshCourse || course);
              } catch (err) {
                console.error("Failed to fetch fresh course details:", err);
                setActiveCourse(course);
              }
              setCurrentPage('course-player');
            }}
            currentTime={currentTime}
            favoritedTrackIds={favoritedTrackIds}
            onToggleFavorite={handleToggleFavorite}
            onUpgradeClick={handleUpgradeClick}
            queue={queue}
            setQueue={setQueue}
            handleNext={handleNext}
            handlePrev={handlePrev}
            handleSeek={handleSeek}
          />
        )}

        {currentPage === 'course-player' && (
          <CoursePlayer 
            course={activeCourse}
            onBack={() => setCurrentPage('course')}
            onViewChange={setCoursePlayerView}
            setCurrentPage={setCurrentPage}
            currentTrack={currentTrack}
            user={user}
            onUpgradeClick={handleUpgradeClick}
          />
        )}

        {currentPage === 'hub' && (
          <div className="pt-32 pb-32">
            <StudentHub />
          </div>
        )}

        {currentPage === 'library' && (
          <SongLibrary
            tracks={globalTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
          />
        )}

        {currentPage === 'forum' && (
          <CommunityForum user={user} />
        )}

        {currentPage === 'blog' && <Blog />}
        {currentPage === 'about' && <AboutUs />}
        {currentPage === 'contact' && <ContactUs />}

        {currentPage === 'login' && (
          <LoginSignup
            onLoginSuccess={(sessionUser) => {
              setUser(sessionUser);
              if (postLoginRedirect) {
                setCurrentPage(postLoginRedirect);
                setPostLoginRedirect(null);
              } else {
                setCurrentPage('dashboard');
              }
            }}
            setCurrentPage={setCurrentPage}
          />
        )}



        {currentPage === 'checkout' && (
          <Checkout 
            user={user}
            setCurrentPage={setCurrentPage}
            onCheckoutSuccess={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('neetband_current_user', JSON.stringify(updatedUser));
              setCurrentPage('dashboard');
            }}
          />
        )}

        {currentPage === 'lms-login' && (
          <LMSLogin
            onLoginSuccess={(sessionUser) => {
              setLmsUser(sessionUser);
              setCurrentPage('lms');
            }}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'lms' && (
          isAuthLoading ? (
            <div className="min-h-[80vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AdminDashboard 
              setCurrentPage={setCurrentPage} 
              user={lmsUser} 
              theme={theme}
              setTheme={setTheme}
            />
          )
        )} 

        {currentPage === 'affiliate-login' && (
          <AffiliateLogin
            onLoginSuccess={(sessionUser) => {
              setAffiliateUser(sessionUser);
              setCurrentPage('affiliate');
            }}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'affiliate' && (
          <AffiliateDashboard user={affiliateUser} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === '404' && (
          <NotFound setCurrentPage={setCurrentPage} />
        )}
      </main>

      {['home', 'blog', 'about', 'contact'].includes(currentPage) && (
        <div className={currentPage !== 'home' ? 'hidden md:block' : ''}>
          <Footer setCurrentPage={setCurrentPage} />
        </div>
      )}

      {/* Players */}
      {!['login', 'lms-login', 'lms', 'affiliate', 'affiliate-login', 'checkout'].includes(currentPage) && (
        <>
          <StickyPlayer 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            currentTime={currentTime}
            onNext={handleNext}
            onPrev={handlePrev}
            onSeek={handleSeek}
            favoritedTrackIds={favoritedTrackIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
          />

          <MobilePlayer 
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            currentTime={currentTime}
            onNext={handleNext}
            favoritedTrackIds={favoritedTrackIds}
            onToggleFavorite={handleToggleFavorite}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
          />
        </>
      )}

      {!['login', 'lms-login', 'lms', 'affiliate', 'affiliate-login', 'checkout'].includes(currentPage) && <MobileNavbar currentPage={currentPage} setCurrentPage={setCurrentPage} user={user} />}

      {/* PWA install prompt */}
      <PWAInstallPrompt />

      {/* Modals */}
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
      />
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        currentTime={currentTime}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        favoritedTrackIds={favoritedTrackIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Go To Top Button */}
      <GoToTop currentPage={currentPage} />

      {/* Hidden Audio Player */}
      {currentTrack && currentTrack.audioUrl && (
        <audio
          ref={audioRef}
          src={currentTrack.audioUrl}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onEnded={handleNext}
        />
      )}
    </>
  );
}
