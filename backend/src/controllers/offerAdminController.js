import BookClaim from '../models/BookClaim.js';
import EyeCheckupClaim from '../models/EyeCheckupClaim.js';

export const getBookClaims = async (req, res) => {
  try {
    const claims = await BookClaim.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book claims' });
  }
};

export const updateBookClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await BookClaim.findByIdAndUpdate(req.params.id, { dispatchStatus: status }, { new: true });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book claim' });
  }
};

export const getEyeCheckupClaims = async (req, res) => {
  try {
    const claims = await EyeCheckupClaim.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching eye checkup claims' });
  }
};

export const updateEyeCheckupStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await EyeCheckupClaim.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Error updating eye checkup claim' });
  }
};
