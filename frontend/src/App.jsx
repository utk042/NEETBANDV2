import React, { Suspense } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';

import { UserAuthProvider, useUserAuth } from './contexts/UserAuthContext';
import { LmsAuthProvider } from './contexts/LmsAuthContext';
import { AffiliateAuthProvider } from './contexts/AffiliateAuthContext';
import { PlayerProvider } from './contexts/PlayerContext';

import UserRoutes from './routes/UserRoutes';
import CustomCursor from './components/CustomCursor';
import { lazyWithRetry } from './utils/lazyWithRetry';
const LmsRoutes = lazyWithRetry(() => import('./routes/LmsRoutes'));
const AffiliateRoutes = lazyWithRetry(() => import('./routes/AffiliateRoutes'));

function AppContent() {
  const location = useLocation();
  const { user } = useUserAuth();

  let content;
  if (location.pathname.startsWith('/lms')) {
    content = <LmsRoutes />;
  } else if (location.pathname.startsWith('/affiliate')) {
    content = <AffiliateRoutes />;
  } else {
    content = <UserRoutes />;
  }

  const showCustomCursor = !location.pathname.startsWith('/lms') && !location.pathname.startsWith('/affiliate');

  return (
    <PlayerProvider user={user}>
      <LmsAuthProvider>
        <AffiliateAuthProvider>
          <Suspense fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xl z-loading">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          }>
            {content}
          </Suspense>
          {showCustomCursor && <CustomCursor />}
        </AffiliateAuthProvider>
      </LmsAuthProvider>
    </PlayerProvider>
  );
}

export default function App() {
  return (
    <Router>
      <UserAuthProvider>
        <AppContent />
      </UserAuthProvider>
    </Router>
  );
}
