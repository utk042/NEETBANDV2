import BookClaim from '../models/BookClaim.js';
import EyeCheckupClaim from '../models/EyeCheckupClaim.js';

// --- Book Claims ---

export const getBookClaims = async (req, res) => {
  try {
    const claims = await BookClaim.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book claims' });
  }
};

export const createBookClaim = async (req, res) => {
  try {
    const claim = new BookClaim(req.body);
    await claim.save();
    const populated = await BookClaim.findById(claim._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating book claim:', error);
    res.status(500).json({ message: 'Error creating book claim' });
  }
};

export const updateBookClaimStatus = async (req, res) => {
  try {
    // Note: We check if req.body has only status, then it's a quick status update
    // Otherwise it's a full update
    const updateData = (Object.keys(req.body).length === 1 && req.body.status) ? { dispatchStatus: req.body.status } : req.body;
    
    const claim = await BookClaim.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('user', 'name email');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    console.error('Error updating book claim:', error);
    res.status(500).json({ message: 'Error updating book claim' });
  }
};

export const deleteBookClaim = async (req, res) => {
  try {
    const claim = await BookClaim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json({ message: 'Book claim deleted' });
  } catch (error) {
    console.error('Error deleting book claim:', error);
    res.status(500).json({ message: 'Error deleting book claim' });
  }
};


// --- Eye Checkup Claims ---

export const getEyeCheckupClaims = async (req, res) => {
  try {
    const claims = await EyeCheckupClaim.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching eye checkup claims' });
  }
};

export const createEyeCheckupClaim = async (req, res) => {
  try {
    const claim = new EyeCheckupClaim(req.body);
    await claim.save();
    const populated = await EyeCheckupClaim.findById(claim._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating eye checkup claim:', error);
    res.status(500).json({ message: 'Error creating eye checkup claim' });
  }
};

export const updateEyeCheckupStatus = async (req, res) => {
  try {
    // Note: We check if req.body has only status, then it's a quick status update
    // Otherwise it's a full update
    const updateData = (Object.keys(req.body).length === 1 && req.body.status) ? { status: req.body.status } : req.body;

    const claim = await EyeCheckupClaim.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('user', 'name email');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    console.error('Error updating eye checkup claim:', error);
    res.status(500).json({ message: 'Error updating eye checkup claim' });
  }
};

export const deleteEyeCheckupClaim = async (req, res) => {
  try {
    const claim = await EyeCheckupClaim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json({ message: 'Eye checkup claim deleted' });
  } catch (error) {
    console.error('Error deleting eye checkup claim:', error);
    res.status(500).json({ message: 'Error deleting eye checkup claim' });
  }
};
