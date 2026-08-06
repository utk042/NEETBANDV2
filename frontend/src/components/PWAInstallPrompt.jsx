import React, { useState, useEffect } from 'react';
import { IconDownload, IconX } from '@tabler/icons-react';

/**
 * PWAInstallPrompt
 * Shows a native-feeling install banner when the browser fires
 * the `beforeinstallprompt` event (Chrome/Edge/Android).
 * iOS users see a Share-to-Home-Screen tip instead (no JS API available).
 *
 * Persistence rules:
 *  - Dismissing only hides it for the current session (no permanent flag).
 *  - On every page refresh the prompt re-appears if the app is not installed.
 *  - Once the user installs, `pwa-installed` is stored in localStorage so the
 *    prompt stays hidden permanently… until the app is uninstalled.
 *  - After uninstall, the browser fires `beforeinstallprompt` again; we ALWAYS
 *    have a listener attached to catch it, clear `pwa-installed`, and re-show.
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner]         = useState(false);
  const [isIOS, setIsIOS]                   = useState(false);
  // sessionDismissed is in-memory only — resets every page load
  const [sessionDismissed, setSessionDismissed] = useState(false);

  useEffect(() => {
    // Already running as an installed PWA — never show the prompt
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Migrate: clear the old permanent-dismiss key from the previous version
    // so users who were permanently blocked start seeing the prompt again.
    localStorage.removeItem('pwa-prompt-dismissed');

    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // iOS has no JS install API — show the tip on every page load unless
      // the user tapped our Install button (which sets pwa-installed for iOS).
      if (!localStorage.getItem('pwa-installed')) {
        const t = setTimeout(() => setShowBanner(true), 4000);
        return () => clearTimeout(t);
      }
      return;
    }

    // ── Android / Chrome / Edge ────────────────────────────────────────────
    //
    // KEY FIX: We ALWAYS attach this listener regardless of pwa-installed.
    //
    // Why: If we returned early when pwa-installed is set, we'd never hear
    // the re-fired beforeinstallprompt that signals an uninstall. The listener
    // must be alive so we can clear the stale flag and re-show the banner.
    //
    // When beforeinstallprompt fires it always means the app is NOT currently
    // installed (Chrome won't fire it for an already-installed app), so it is
    // safe to always clear pwa-installed and show the banner here.
    const handler = (e) => {
      e.preventDefault();
      // App is not installed (or was just uninstalled). Clear any stale flag.
      localStorage.removeItem('pwa-installed');
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Fired by the browser after the user completes installation
    const onInstalled = () => {
      localStorage.setItem('pwa-installed', '1');
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // appinstalled event also fires, but set the flag here as a fallback
      localStorage.setItem('pwa-installed', '1');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Dismiss only hides for this session — no localStorage write
  const handleDismiss = () => {
    setShowBanner(false);
    setSessionDismissed(true);
  };

  if (!showBanner || sessionDismissed) return null;

  return (
    <div
      role="dialog"
      aria-label="Install NeetBand App"
      className="fixed top-24 md:top-auto md:bottom-28 left-4 right-4 md:right-auto md:left-6 md:max-w-sm z-toast animate-[slideDown_0.3s_cubic-bezier(0.16,1,0.3,1)] md:animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="bg-surface-container border border-[var(--border-floating-card)] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-4 flex items-start gap-4">
        {/* App icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <IconDownload size={22} className="text-primary" aria-hidden="true" />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-on-surface leading-snug">
            {isIOS ? 'Add to Home Screen' : 'Install NeetBand'}
          </p>
          <p className="text-xs text-on-surface-variant/70 mt-0.5 leading-relaxed">
            {isIOS
              ? "Tap Share → \"Add to Home Screen\" for the full app experience."
              : 'Study offline, faster loading, native app feel.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Dismiss"
          >
            <IconX size={16} aria-hidden="true" />
          </button>
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
            >
              Install
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
