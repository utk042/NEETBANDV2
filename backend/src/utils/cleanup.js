import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Song from '../models/Song.js';
import AdConfig from '../models/AdConfig.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

export const startBackgroundCleanup = () => {
  // Run every 24 hours
  setInterval(cleanupOrphans, 24 * 60 * 60 * 1000);
  
  // Also run once 5 minutes after startup to clean up recent orphans without blocking boot
  setTimeout(cleanupOrphans, 5 * 60 * 1000);
};

const cleanupOrphans = async () => {
  try {
    console.log('[Cleanup] Starting orphaned files cleanup...');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const walkDir = (dir, fileList = []) => {
      if (!fs.existsSync(dir)) return fileList;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walkDir(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      }
      return fileList;
    };

    if (!fs.existsSync(uploadsDir)) return;
    
    // Only target 'audio' and 'video' folders to prevent accidental deletion of rich-text embedded images
    // which may not have explicit database column references.
    const audioDir = path.join(uploadsDir, 'audio');
    const videoDir = path.join(uploadsDir, 'video');
    const allFiles = [...walkDir(audioDir), ...walkDir(videoDir)];
    
    let deletedCount = 0;

    for (const filePath of allFiles) {
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < oneDayAgo) {
        // Construct the URL format stored in DB
        const relativeToUploads = path.relative(uploadsDir, filePath).replace(/\\/g, '/');
        const fileUrl = `/uploads/${relativeToUploads}`;

        // Check if referenced in DB
        const inSong = await Song.exists({
          $or: [
            { audioUrl: fileUrl },
            { audioRollUrl: fileUrl },
            { cover: fileUrl }
          ]
        });

        const inAd = await AdConfig.exists({
          $or: [
            { audioRollUrl: fileUrl },
            { guestAdUrl: fileUrl }
          ]
        });

        const inCourse = await Course.exists({
          $or: [
            { coverImage: fileUrl },
            { promoVideo: fileUrl }
          ]
        });
        
        if (!inSong && !inAd && !inCourse) {
           fs.unlinkSync(filePath);
           deletedCount++;
           console.log(`[Cleanup] Deleted orphaned file: ${fileUrl}`);
        }
      }
    }
    console.log(`[Cleanup] Finished. Deleted ${deletedCount} orphaned files.`);
  } catch (err) {
    console.error('[Cleanup] Error during orphaned files cleanup:', err);
  }
};
