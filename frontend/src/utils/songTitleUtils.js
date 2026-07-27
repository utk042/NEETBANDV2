/**
 * Converts a song file name or URL into a clean song title by:
 * 1. Decoding URI components (e.g. %20 -> space)
 * 2. Removing file extensions (e.g. .mp3, .wav, .m4a, .flac, .aac, .ogg, etc.)
 * 3. Stripping server upload prefixes (e.g. audio-1722000000000-x9k2p4-)
 * 4. Replacing underscores ('_') and hyphens ('-') with spaces
 * 5. Cleaning up multiple consecutive spaces and trimming whitespace
 *
 * @param {string} fileName - The filename, title, or path of the song file
 * @returns {string} - Cleaned song title
 */
export function cleanSongTitle(fileName) {
  if (!fileName || typeof fileName !== 'string') return '';

  let str = fileName;
  try {
    str = decodeURIComponent(fileName);
  } catch {
    // Keep original if URI decoding fails
  }

  // Extract base file name if a full URL, path, query param, or hash is provided
  let baseName = str.split('/').pop()?.split('?')[0]?.split('#')[0] || str;

  // Remove server upload prefixes if present (e.g. audio-1722000000000-x9k2p4-, file-123456-)
  baseName = baseName.replace(/^(?:audio|file|audioUrl|video|doc|image|uploads?)[-_]\d+[-_](?:[a-z0-9]{5,}[-_])?/i, '');

  // Known media / document file extensions
  const extRegex = /\.(mp3|wav|m4a|flac|aac|ogg|opus|wma|webm|3gp|mp4|m4p|mp2|aiff|aif|caf|mid|midi|pdf|docx?|txt)$/i;

  // Repeatedly strip known audio/media extensions from the end
  while (extRegex.test(baseName)) {
    baseName = baseName.replace(extRegex, '');
  }

  // Fallback: Also remove generic trailing dot extension (e.g. .mp3 with trailing dots/spaces handled)
  baseName = baseName.replace(/\.[^/.]+$|\.[a-zA-Z0-9]+$/i, '');

  return baseName
    .replace(/[-_]/g, ' ')      // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ')       // Normalize multiple spaces into single space
    .trim();
}

