import Song from '../models/Song.js';
import AdConfig from '../models/AdConfig.js';

function sanitizeSongPayload(payload = {}) {
  const data = { ...payload };

  if (typeof data.title === 'string') data.title = data.title.trim();
  if (typeof data.audioUrl === 'string') data.audioUrl = data.audioUrl.trim();
  if (data.overrideGlobalAds !== undefined) data.overrideGlobalAds = Boolean(data.overrideGlobalAds);

  if (!data.courseId || data.courseId === '') {
    data.courseId = null;
  }

  if (data.duration !== undefined && data.duration !== null) {
    if (typeof data.duration === 'string') {
      const trimmed = data.duration.trim();
      if (trimmed === '') {
        data.duration = null;
      } else {
        const parsed = Number(trimmed);
        if (!isNaN(parsed) && parsed >= 0) {
          data.duration = parsed;
        } else {
          data.duration = null;
        }
      }
    } else if (typeof data.duration === 'number' && isNaN(data.duration)) {
      data.duration = null;
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

  if (Array.isArray(data.popupPositions)) {
    const parsedPositions = data.popupPositions.map(p => Math.round(Number(p)));
    const invalidPositions = parsedPositions.filter(p => isNaN(p) || p < 0 || p > 100);
    if (invalidPositions.length > 0) {
      throw new Error('Popup positions must be numbers between 0 and 100');
    }
    data.popupPositions = [...new Set(parsedPositions)].sort((a, b) => a - b);
  }
  if (Array.isArray(data.audioRollPositions)) {
    const parsedPositions = data.audioRollPositions.map(p => Math.round(Number(p)));
    const invalidPositions = parsedPositions.filter(p => isNaN(p) || p < 0 || p > 100);
    if (invalidPositions.length > 0) {
      throw new Error('Audio roll positions must be numbers between 0 and 100');
    }
    data.audioRollPositions = [...new Set(parsedPositions)].sort((a, b) => a - b);
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

export const getSongs = async (req, res) => {
  try {
    const { class: className, subject, courseId, songType, search, sortBy, sortOrder } = req.query;
    let query = {};
    
    if (className) query.class = className;
    if (subject) query.subject = subject;
    if (courseId) query.courseId = courseId;
    if (songType && songType !== 'All') query.songType = songType;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { subject: regex },
        { class: regex },
        { chapter: regex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'title') sortOption = { title: order };
      else if (sortBy === 'class') sortOption = { class: order, title: 1 };
      else if (sortBy === 'subject') sortOption = { subject: order, title: 1 };
      else if (sortBy === 'playCount') sortOption = { playCount: order };
      else if (sortBy === 'createdAt') sortOption = { createdAt: order };
    }

    const songs = await Song.find(query).sort(sortOption).populate('courseId', 'title');
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
    const { title, audioUrl, duration, __v } = sanitized;

    if (title !== undefined && !title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (audioUrl !== undefined && !audioUrl) {
      return res.status(400).json({ message: 'Audio URL is required' });
    }
    if (duration !== undefined && duration !== null && (typeof duration !== 'number' || duration < 0)) {
      return res.status(400).json({ message: 'Duration cannot be negative' });
    }

    const query = { _id: req.params.id };
    if (__v !== undefined) {
      query.__v = __v;
    }
    delete sanitized.__v;

    const update = { $set: sanitized };
    if (__v !== undefined) {
      update.$inc = { __v: 1 };
    }

    const song = await Song.findOneAndUpdate(query, update, { new: true, runValidators: true });
    
    if (song) {
      res.json(song);
    } else {
      const existing = await Song.findById(req.params.id);
      if (existing) {
        return res.status(409).json({ message: 'Conflict: Document was updated by another user. Please reload and try again.' });
      }
      return res.status(404).json({ message: 'Song not found' });
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


const processedIdempotencyKeys = new Map();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

const checkIdempotency = (req) => {
  const key = req.headers['x-idempotency-key'] || req.body?.idempotencyKey;
  if (!key) return false;
  const now = Date.now();
  if (processedIdempotencyKeys.has(key)) {
    const timestamp = processedIdempotencyKeys.get(key);
    if (now - timestamp < IDEMPOTENCY_TTL_MS) {
      return true; // Duplicate request
    }
  }
  processedIdempotencyKeys.set(key, now);
  if (processedIdempotencyKeys.size > 5000) {
    for (const [k, ts] of processedIdempotencyKeys.entries()) {
      if (now - ts > IDEMPOTENCY_TTL_MS) processedIdempotencyKeys.delete(k);
    }
  }
  return false;
};

// @desc    Record a play event for a song
// @route   POST /songs/:id/play
// @access  Public
export const recordPlay = async (req, res) => {
  try {
    if (checkIdempotency(req)) {
      return res.json({ success: true, duplicate: true });
    }
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });
    if (!song) return res.status(404).json({ message: 'Song not found' });
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
    if (checkIdempotency(req)) {
      return res.json({ success: true, duplicate: true });
    }
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { completionCount: 1 } });
    if (!song) return res.status(404).json({ message: 'Song not found' });
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
    if (checkIdempotency(req)) {
      return res.json({ success: true, duplicate: true });
    }
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } });
    if (!song) return res.status(404).json({ message: 'Song not found' });
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
    if (checkIdempotency(req)) {
      return res.json({ success: true, duplicate: true });
    }
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { repeatCount: 1 } });
    if (!song) return res.status(404).json({ message: 'Song not found' });
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
    if (checkIdempotency(req)) {
      return res.json({ success: true, duplicate: true });
    }
    const segment = parseInt(req.body.segment, 10);
    if (isNaN(segment) || segment < 0 || segment > 9) {
      return res.status(400).json({ message: 'segment must be 0-9' });
    }
    const update = {};
    update[`dropOffDistribution.${segment}`] = 1;
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: update });
    if (!song) return res.status(404).json({ message: 'Song not found' });
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
