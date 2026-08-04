import express from 'express';
import Benefit from '../models/Benefit.js';

const router = express.Router();

const DEFAULT_BENEFITS = [
  {
    title: "Biannual Comprehensive Eye Check-up",
    provider: "Eye Hospitals Network",
    category: "Health",
    offerType: "Free Service",
    timing: "Biannual",
    description: "A complete vision and eye-health screening by certified optometrists — twice a year, on us.",
    memberValue: "Free",
    code: "EYEFREE2026",
    link: "/offers/eye-checkup",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    badgeText: "Member-exclusive",
    isFeatured: true,
    isAvailable: true,
    order: 1
  },
  {
    title: "Book Discounts",
    provider: "Sparrow Publications",
    category: "Learning",
    offerType: "Discount",
    timing: "Ongoing",
    description: "Flat discount on book: 'How to Protect Your Child's Eyes in the Age of Screens'",
    memberValue: "25% off",
    code: "NEETVISION50",
    link: "/offers/book",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
    badgeText: "Member-exclusive",
    isFeatured: false,
    isAvailable: true,
    order: 2
  },
  {
    title: "Student Growth & Wellness Offers",
    provider: "NeetBand Wellness Partners",
    category: "Health",
    offerType: "Discount",
    timing: "Ongoing",
    description: "Curated learning, sports, wellness, and productivity resources that may help students maintain focus.",
    memberValue: "40% off",
    code: "STUDENTGROWTH40",
    link: "/hub",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    badgeText: "Popular",
    isFeatured: false,
    isAvailable: true,
    order: 3
  },
  {
    title: "Posture Correction Study Chair",
    provider: "ErgoDesk India",
    category: "Lifestyle",
    offerType: "Discount",
    timing: "Ongoing",
    description: "Ergonomic seating designed for 10+ hours of NEET preparation. Prevents spine fatigue and body strain.",
    memberValue: "20% off",
    code: "ERGONEET20",
    link: "/hub",
    imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6d1274?q=80&w=800&auto=format&fit=crop",
    badgeText: "Member-exclusive",
    isFeatured: false,
    isAvailable: true,
    order: 4
  },
  {
    title: "Medical-Grade Blue-Light Blockers",
    provider: "VisionShield Optics",
    category: "Health",
    offerType: "Perk",
    timing: "Limited Time",
    description: "Protect your eyes during late-night study sessions with zero-power anti-glare specs tailored for students.",
    memberValue: "Buy 1 Get 1",
    code: "BLUELIGHTBOGO",
    link: "/hub",
    imageUrl: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=800&auto=format&fit=crop",
    badgeText: "Hot Deal",
    isFeatured: false,
    isAvailable: true,
    order: 5
  },
  {
    title: "NEET High-Yield Audio Mnemonics",
    provider: "NeetBand Audio Labs",
    category: "Learning",
    offerType: "Free Service",
    timing: "Ongoing",
    description: "Complete library of NCERT Biology & Chemistry formula tunes and active recall memory tracks.",
    memberValue: "Full Access",
    code: "AUDIOMAGIC",
    link: "/library",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    badgeText: "Exclusive",
    isFeatured: true,
    isAvailable: true,
    order: 6
  }
];

// GET /benefits - Fetch all active benefits (auto-seeds if empty)
router.get('/', async (req, res) => {
  try {
    let benefits = await Benefit.find().sort({ order: 1, createdAt: -1 });
    
    if (benefits.length === 0) {
      benefits = await Benefit.insertMany(DEFAULT_BENEFITS);
    }
    
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({ message: 'Failed to fetch benefits' });
  }
});

// GET /benefits/admin - Fetch all benefits including inactive ones (LMS Admin)
router.get('/admin/all', async (req, res) => {
  try {
    let benefits = await Benefit.find().sort({ order: 1, createdAt: -1 });
    if (benefits.length === 0) {
      benefits = await Benefit.insertMany(DEFAULT_BENEFITS);
    }
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching admin benefits:', error);
    res.status(500).json({ message: 'Failed to fetch benefits' });
  }
});

// POST /benefits - Create a new benefit
router.post('/', async (req, res) => {
  try {
    const {
      title,
      provider,
      category,
      offerType,
      timing,
      description,
      memberValue,
      imageUrl,
      code,
      link,
      badgeText,
      isFeatured,
      isAvailable,
      order
    } = req.body;

    if (!title || !provider || !description) {
      return res.status(400).json({ message: 'Title, provider, and description are required.' });
    }

    const newBenefit = new Benefit({
      title,
      provider,
      category: category || 'Health',
      offerType: offerType || 'Discount',
      timing: timing || 'Ongoing',
      description,
      memberValue: memberValue || 'Special Offer',
      imageUrl: imageUrl || '',
      code: code || '',
      link: link || '',
      badgeText: badgeText || 'Member-exclusive',
      isFeatured: Boolean(isFeatured),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      order: Number(order) || 0
    });

    const saved = await newBenefit.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(500).json({ message: 'Failed to create benefit' });
  }
});

// PUT /benefits/:id - Update existing benefit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };

    const updated = await Benefit.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating benefit:', error);
    res.status(500).json({ message: 'Failed to update benefit' });
  }
});

// PATCH /benefits/:id/toggle - Toggle availability
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const benefit = await Benefit.findById(id);
    if (!benefit) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    benefit.isAvailable = !benefit.isAvailable;
    benefit.updatedAt = Date.now();
    await benefit.save();

    res.json(benefit);
  } catch (error) {
    console.error('Error toggling benefit availability:', error);
    res.status(500).json({ message: 'Failed to toggle availability' });
  }
});

// DELETE /benefits/:id - Delete a benefit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Benefit.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Benefit not found' });
    }

    res.json({ message: 'Benefit deleted successfully', id });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    res.status(500).json({ message: 'Failed to delete benefit' });
  }
});

export default router;
