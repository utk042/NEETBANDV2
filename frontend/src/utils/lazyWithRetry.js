import React from 'react';

/**
 * Wraps React.lazy to automatically reload the page once when a dynamic import fails
 * (e.g. because a new version of the app was deployed and old chunks were deleted).
 * Enforces a 15-second cooldown between reloads to strictly prevent infinite reload loops.
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(() =>
    componentImport().catch((error) => {
      const errorMessage = error?.message || '';
      const errorName = error?.name || '';

      const isChunkLoadFailed =
        errorName === 'ChunkLoadError' ||
        /dynamically imported module/i.test(errorMessage) ||
        /loading chunk/i.test(errorMessage) ||
        /failed to load module script/i.test(errorMessage) ||
        /importing a module script failed/i.test(errorMessage);

      if (isChunkLoadFailed) {
        try {
          const lastReload = parseInt(window.sessionStorage.getItem('last_chunk_reload_time') || '0', 10);
          const now = Date.now();
          // Only attempt a reload if we haven't reloaded due to a chunk error in the last 15 seconds
          if (!lastReload || now - lastReload > 15000) {
            window.sessionStorage.setItem('last_chunk_reload_time', now.toString());
            window.location.reload();
            return new Promise((_, reject) => {
              setTimeout(() => reject(error), 5000);
            });
          }
        } catch (e) {
          console.warn('sessionStorage not available or failed to reload:', e);
        }
      }
      throw error;
    })
  );
}
