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
