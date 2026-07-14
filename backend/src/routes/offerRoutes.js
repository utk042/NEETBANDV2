import express from 'express';
import { protect, premiumOnly } from '../middlewares/authMiddleware.js';
import BookClaim from '../models/BookClaim.js';
import EyeCheckupClaim from '../models/EyeCheckupClaim.js';

const router = express.Router();

// POST /api/offers/book
router.post('/book', protect, premiumOnly, async (req, res) => {
  try {
    const { address, phone } = req.body;
    
    if (!address || !phone) {
      return res.status(400).json({ message: 'Address and phone are required' });
    }

    const claim = new BookClaim({
      user: req.user._id,
      address,
      phone,
      paymentStatus: 'Completed', // Simulated success
      dispatchStatus: 'Pending Dispatch'
    });

    await claim.save();

    res.status(201).json({ message: 'Book purchase successful!', claim });
  } catch (error) {
    console.error('Book offer error:', error);
    res.status(500).json({ message: 'Server error processing book purchase' });
  }
});

// POST /api/offers/eye-checkup
router.post('/eye-checkup', protect, premiumOnly, async (req, res) => {
  try {
    const { name, email, phone, location, preferredDate } = req.body;
    
    if (!name || !email || !phone || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const claim = new EyeCheckupClaim({
      user: req.user._id,
      name,
      email,
      phone,
      location,
      preferredDate
    });

    await claim.save();

    res.status(201).json({ message: 'Eye checkup requested successfully!', claim });
  } catch (error) {
    console.error('Eye checkup offer error:', error);
    res.status(500).json({ message: 'Server error processing eye checkup request' });
  }
});

export default router;
