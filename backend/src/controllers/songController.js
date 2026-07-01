import Song from '../models/Song.js';

// @desc    Create a new song
// @route   POST /api/songs
// @access  Private/Admin
export const createSong = async (req, res) => {
  try {
    const song = new Song(req.body);
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
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
