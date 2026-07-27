/**
 * Converts a song file name or URL into a clean song title by:
 * 1. Decoding URI components (e.g. %20 -> space)
 * 2. Extracting the basename from a full URL or path
 * 3. Stripping server upload prefixes (e.g. audio-1722000000000-x9k2p4-)
 * 4. Removing known audio/media file extensions from the last dot segment only
 * 5. Replacing underscores ('_') and hyphens ('-') with spaces
 * 6. Cleaning up multiple consecutive spaces and trimming whitespace
 *
 * @param {string} fileName - The filename, title, or URL of the song file
 * @returns {string} - Cleaned song title, or '' if the result is an unrecoverable hash
 */

const AUDIO_EXTENSIONS = new Set([
  'mp3', 'wav', 'm4a', 'flac', 'aac', 'ogg', 'opus', 'wma', 'webm',
  '3gp', 'mp4', 'm4p', 'mp2', 'aiff', 'aif', 'caf', 'mid', 'midi',
  'mpeg', 'mpga', 'amr', 'pdf', 'docx', 'doc', 'txt',
]);

export function cleanSongTitle(fileName) {
  if (!fileName || typeof fileName !== 'string') return '';

  let str = fileName;
  try {
    str = decodeURIComponent(fileName);
  } catch {
    // Keep original if URI decoding fails
  }

  // Extract base name from URL/path (strip path, query, fragment)
  let baseName = str.split('/').pop()?.split('?')[0]?.split('#')[0] || str;

  // Strip server-generated upload prefix: fieldname-timestamp-hash-
  // Matches patterns like: file-1769502978000-32f7v6m52m9- or audio-1722000000-x9k2p4-
  baseName = baseName.replace(/^[a-zA-Z]+[-_]\d{10,}[-_][a-zA-Z0-9]+[-_]/i, '');

  // Remove the file extension ONLY if it is a known audio/media extension.
  // Uses lastIndexOf to avoid stripping dots inside the title (e.g. "v1.0" in "Biology v1.0.mp3").
  const lastDotIdx = baseName.lastIndexOf('.');
  if (lastDotIdx !== -1) {
    const ext = baseName.slice(lastDotIdx + 1).toLowerCase();
    if (AUDIO_EXTENSIONS.has(ext)) {
      baseName = baseName.slice(0, lastDotIdx);
    }
  }

  const result = baseName
    .replace(/[-_]/g, ' ')   // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ')    // Normalize multiple spaces into single space
    .trim();

  // If the result is a pure server-generated hash or looks like a raw upload prefix
  // (all lowercase alphanumeric, no spaces, 8+ chars), return empty string so the
  // user knows to type their own title rather than seeing a meaningless random string.
  if (
    /^[a-z0-9]{8,}$/.test(result) ||
    /^(?:file|audio|video|doc|image)\s+\d/.test(result)
  ) {
    return '';
  }

  return result;
}
