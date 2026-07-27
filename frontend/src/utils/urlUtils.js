/**
 * Resolves an audio URL to a fully qualified URL.
 * Handles absolute URLs (http, https, blob, data) and relative paths (/uploads/...).
 */
export const resolveAudioUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const normalized = trimmed.replace(/\\/g, '/');
  
  if (/^[a-zA-Z]:\//.test(normalized)) {
    // Convert local Windows file paths to clean relative endpoint paths
    const relativePart = normalized.substring(normalized.indexOf('/') + 1);
    const cleanRelative = relativePart.startsWith('/') ? relativePart : `/${relativePart}`;
    return `${API_URL}${cleanRelative}`;
  }

  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${API_URL}${cleanPath}`;
};

/**
 * Safely formats a time in seconds to MM:SS or HH:MM:SS.
 * Handles NaN, Infinity, negative values, and non-numeric inputs without returning NaN:NaN.
 */
export const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = Math.floor(totalSecs % 60);

  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;

  if (hours > 0) {
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hours}:${minsStr}:${secsStr}`;
  }
  return `${mins}:${secsStr}`;
};
