import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin/Owner)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching coupons' });
  }
};

// @desc    Get single coupon by ID
// @route   GET /api/admin/coupons/:id
// @access  Private (Admin/Owner)
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching coupon' });
  }
};

// @desc    Create new coupon
// @route   POST /api/admin/coupons
// @access  Private (Admin/Owner)
export const createCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon with code "${normalizedCode}" already exists` });
    }

    const couponData = {
      ...req.body,
      code: normalizedCode
    };

    const coupon = new Coupon(couponData);
    await coupon.save();

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating coupon' });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (Admin/Owner)
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (req.body.code) {
      const normalizedCode = req.body.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: normalizedCode, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `Coupon with code "${normalizedCode}" already exists` });
      }
      req.body.code = normalizedCode;
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (Admin/Owner)
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting coupon' });
  }
};

// @desc    Toggle coupon active status
// @route   PATCH /api/admin/coupons/:id/toggle
// @access  Private (Admin/Owner)
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error toggling coupon status' });
  }
};

// @desc    Bulk create coupons with same settings but unique codes
// @route   POST /api/admin/coupons/bulk
// @access  Private (Admin/Owner)
export const bulkCreateCoupons = async (req, res) => {
  try {
    const { count, template } = req.body;

    if (!count || count < 1 || count > 500) {
      return res.status(400).json({ message: 'Count must be between 1 and 500' });
    }

    if (!template) {
      return res.status(400).json({ message: 'Coupon template is required' });
    }

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const createdCoupons = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      let code;
      let attempts = 0;
      do {
        code = generateCode();
        attempts++;
      } while (await Coupon.findOne({ code }) && attempts < 10);

      if (attempts >= 10) {
        errors.push(`Failed to generate unique code for coupon #${i + 1}`);
        continue;
      }

      try {
        const coupon = new Coupon({ ...template, code });
        await coupon.save();
        createdCoupons.push(coupon);
      } catch (err) {
        errors.push(`Failed to create coupon #${i + 1}: ${err.message}`);
      }
    }

    res.status(201).json({
      created: createdCoupons.length,
      errors: errors.length,
      errorMessages: errors,
      coupons: createdCoupons
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error bulk creating coupons' });
  }
};
