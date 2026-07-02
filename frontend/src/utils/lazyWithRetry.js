import React from 'react';

/**
 * Wraps React.lazy to automatically reload the page when a dynamic import fails
 * (e.g. because a new version of the app was deployed and old chunks were deleted).
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(() =>
    componentImport()
      .then((module) => {
        try {
          window.sessionStorage.removeItem('page-has-been-reloaded');
        } catch (e) {
          console.warn('Failed to access sessionStorage:', e);
        }
        return module;
      })
      .catch((error) => {
        const errorMessage = error.message || '';
        const errorName = error.name || '';
        
        const isChunkLoadFailed =
          errorName === 'TypeError' ||
          /dynamically imported module/i.test(errorMessage) ||
          /failed to fetch/i.test(errorMessage) ||
          /loading chunk/i.test(errorMessage) ||
          /failed to load module script/i.test(errorMessage);

        if (isChunkLoadFailed) {
          try {
            const hasReloaded = window.sessionStorage.getItem('page-has-been-reloaded') === 'true';
            if (!hasReloaded) {
              window.sessionStorage.setItem('page-has-been-reloaded', 'true');
              window.location.reload();
              // Return a pending promise so Suspense stays in loading state and avoids crashing
              return new Promise(() => {});
            }
          } catch (e) {
            console.warn('sessionStorage not available or failed to reload:', e);
          }
        }
        throw error;
      })
  );
}
