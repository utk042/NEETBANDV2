/**
 * Converts a song file name into a clean song title by:
 * 1. Removing the file extension (e.g. .mp3, .wav, .m4a, .flac)
 * 2. Replacing underscores ('_') and hyphens ('-') with spaces
 * 3. Cleaning up multiple consecutive spaces and trimming whitespace
 *
 * @param {string} fileName - The filename or path of the song file
 * @returns {string} - Cleaned song title
 */
export function cleanSongTitle(fileName) {
  if (!fileName || typeof fileName !== 'string') return '';

  // Extract base file name if a full URL or path is provided
  const baseName = fileName.split('/').pop()?.split('?')[0] || fileName;

  return baseName
    .replace(/\.[^/.]+$/, '')  // Remove file extension
    .replace(/[-_]/g, ' ')      // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ')       // Normalize multiple spaces into single space
    .trim();
}
