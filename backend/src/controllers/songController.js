import Song from '../models/Song.js';
import AdConfig from '../models/AdConfig.js';

function sanitizeSongPayload(payload = {}) {
  const data = { ...payload };

  if (typeof data.title === 'string') data.title = data.title.trim();
  if (typeof data.audioUrl === 'string') data.audioUrl = data.audioUrl.trim();

  if (!data.courseId || data.courseId === '') {
    data.courseId = null;
  }

  if (data.duration !== undefined && data.duration !== null) {
    if (typeof data.duration === 'string') {
      const trimmed = data.duration.trim();
      if (trimmed === '') {
        delete data.duration;
      } else {
        const parsed = Number(trimmed);
        if (!isNaN(parsed) && parsed >= 0) {
          data.duration = parsed;
        } else {
          delete data.duration;
        }
      }
    } else if (typeof data.duration === 'number' && isNaN(data.duration)) {
      delete data.duration;
    }
  }

  if (data.chapterNumber !== undefined && data.chapterNumber !== null) {
    if (typeof data.chapterNumber === 'string') {
      const trimmed = data.chapterNumber.trim();
      if (trimmed === '') {
        data.chapterNumber = null;
      } else {
        const parsed = Number(trimmed);
        data.chapterNumber = !isNaN(parsed) ? parsed : null;
      }
    } else if (typeof data.chapterNumber === 'number' && isNaN(data.chapterNumber)) {
      data.chapterNumber = null;
    }
  }

  if (Array.isArray(data.watermarkPositions)) {
    data.watermarkPositions = data.watermarkPositions
      .map(p => Number(p))
      .filter(p => !isNaN(p) && p >= 0 && p <= 100);
  }
  if (Array.isArray(data.popupPositions)) {
    data.popupPositions = data.popupPositions
      .map(p => Number(p))
      .filter(p => !isNaN(p) && p >= 0 && p <= 100);
  }

  return data;
}

// @desc    Create a new song
// @route   POST /api/songs
// @access  Private/Admin
export const createSong = async (req, res) => {
  try {
    const sanitized = sanitizeSongPayload(req.body);
    const { title, audioUrl, duration } = sanitized;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!audioUrl) {
      return res.status(400).json({ message: 'Audio URL is required' });
    }
    if (duration !== undefined && duration !== null && (typeof duration !== 'number' || duration < 0)) {
      return res.status(400).json({ message: 'Duration cannot be negative' });
    }

    const song = new Song(sanitized);
    const createdSong = await song.save();
    res.status(201).json(createdSong);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all songs (with filtering)
// @route   GET /api/songs
// @access  Public
export const getSongs = async (req, res) => {
  try {
    const { class: className, subject, courseId } = req.query;
    let query = {};
    
    if (className) query.class = className;
    if (subject) query.subject = subject;
    if (courseId) query.courseId = courseId;

    const songs = await Song.find(query).populate('courseId', 'title');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get song by ID
// @route   GET /api/songs/:id
// @access  Public
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('courseId', 'title summary');
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a song
// @route   PUT /api/songs/:id
// @access  Private/Admin
export const updateSong = async (req, res) => {
  try {
    const sanitized = sanitizeSongPayload(req.body);
    const { title, audioUrl, duration } = sanitized;

    if (title !== undefined && !title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (audioUrl !== undefined && !audioUrl) {
      return res.status(400).json({ message: 'Audio URL is required' });
    }
    if (duration !== undefined && duration !== null && (typeof duration !== 'number' || duration < 0)) {
      return res.status(400).json({ message: 'Duration cannot be negative' });
    }

    const song = await Song.findByIdAndUpdate(req.params.id, sanitized, { new: true, runValidators: true });
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a song
// @route   DELETE /api/songs/:id
// @access  Private/Admin
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (song) {
      res.json({ message: 'Song removed' });
    } else {
      res.status(404).json({ message: 'Song not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ad URLs from config
// @route   GET /api/ads
// @access  Public
export const getAds = async (req, res) => {
  try {
    const config = await AdConfig.findOne();
    if (config && config.audioRollUrl) {
      return res.json({ ads: [config.audioRollUrl] });
    }
  } catch (error) {
    console.error("Error fetching ad config for pre-roll ads:", error);
  }

  res.json({ ads: [] });
};

// @desc    Record a play event for a song
// @route   POST /songs/:id/play
// @access  Public
export const recordPlay = async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a completion event for a song
// @route   POST /songs/:id/complete
// @access  Public
export const recordCompletion = async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { completionCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a share event for a song
// @route   POST /songs/:id/share
// @access  Public
export const recordShare = async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a repeat event for a song
// @route   POST /songs/:id/repeat
// @access  Public
export const recordRepeat = async (req, res) => {
  try {
    await Song.findByIdAndUpdate(req.params.id, { $inc: { repeatCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a drop-off event at a given segment (0-9)
// @route   POST /songs/:id/dropoff
// @body    { segment: number (0-9) }
// @access  Public
export const recordDropOff = async (req, res) => {
  try {
    const segment = parseInt(req.body.segment, 10);
    if (isNaN(segment) || segment < 0 || segment > 9) {
      return res.status(400).json({ message: 'segment must be 0-9' });
    }
    const update = {};
    update[`dropOffDistribution.${segment}`] = 1;
    await Song.findByIdAndUpdate(req.params.id, { $inc: update });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for a single song
// @route   GET /songs/:id/analytics
// @access  Private/Admin
export const getSongAnalytics = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).select(
      'title subject class playCount completionCount shareCount repeatCount dropOffDistribution duration'
    );
    if (!song) return res.status(404).json({ message: 'Song not found' });
    const rate = song.playCount > 0 ? (song.completionCount / song.playCount * 100) : 0;
    const completionRate = Math.min(rate, 100).toFixed(1);
    res.json({ ...song.toObject(), completionRate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics for ALL songs (admin overview)
// @route   GET /songs/analytics
// @access  Private/Admin
export const getAllSongAnalytics = async (req, res) => {
  try {
    const songs = await Song.find({}).select(
      'title subject class playCount completionCount shareCount repeatCount dropOffDistribution duration'
    ).sort({ playCount: -1 });
    const enriched = songs.map(s => {
      const rate = s.playCount > 0 ? (s.completionCount / s.playCount * 100) : 0;
      return {
        ...s.toObject(),
        completionRate: Math.min(rate, 100).toFixed(1),
      };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
