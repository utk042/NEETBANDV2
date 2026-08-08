import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (Admin/Owner)
export const getCoupons = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = (req.query.limit === 'all' || req.query.limit === '0' || parseInt(req.query.limit, 10) === 0) ? 0 : (parseInt(req.query.limit, 10) || 12);
    const search = req.query.search;

    const query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { code: searchRegex },
        { description: searchRegex }
      ];
    }

    const totalItems = await Coupon.countDocuments(query);

    let cQuery = Coupon.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      cQuery = cQuery.skip((page - 1) * limit).limit(limit);
    }
    const coupons = await cQuery;

    const activeLimit = limit === 0 ? totalItems : limit;
    const totalPages = limit === 0 ? 1 : (Math.ceil(totalItems / limit) || 1);

    res.json({
      coupons,
      data: coupons,
      pagination: {
        page,
        limit: activeLimit,
        totalItems,
        totalPages,
        hasNextPage: limit === 0 ? false : page * limit < totalItems,
        hasPrevPage: page > 1
      }
    });
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

    const targetCount = parseInt(count, 10);
    if (isNaN(targetCount) || targetCount < 1 || targetCount > 500) {
      return res.status(400).json({ message: 'Count must be between 1 and 500' });
    }

    if (!template) {
      return res.status(400).json({ message: 'Coupon template is required' });
    }

    const discountVal = Number(template.discountValue);
    const cleanedTemplate = {
      ...template,
      discountValue: isNaN(discountVal) ? 0 : discountVal
    };

    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // 1. Generate candidate unique codes in memory
    const codeSet = new Set();
    let safetyCounter = 0;
    const maxSafetyAttempts = targetCount * 30;

    while (codeSet.size < targetCount && safetyCounter < maxSafetyAttempts) {
      codeSet.add(generateCode());
      safetyCounter++;
    }

    // 2. Fetch any matching existing codes from DB in a single query
    const candidateCodes = Array.from(codeSet);
    const existingCoupons = await Coupon.find({ code: { $in: candidateCodes } }).select('code').lean();
    const existingCodeSet = new Set(existingCoupons.map(c => c.code));

    // Filter out codes that already exist in DB
    let validCodes = candidateCodes.filter(c => !existingCodeSet.has(c));

    // If collisions reduced count, top up until we have `targetCount` valid unique codes
    safetyCounter = 0;
    while (validCodes.length < targetCount && safetyCounter < maxSafetyAttempts) {
      const newCode = generateCode();
      if (!existingCodeSet.has(newCode) && !validCodes.includes(newCode)) {
        validCodes.push(newCode);
      }
      safetyCounter++;
    }

    if (validCodes.length === 0) {
      return res.status(500).json({ message: 'Unable to generate unique coupon codes' });
    }

    // 3. Prepare objects for batch insertion
    const docsToInsert = validCodes.map(code => ({
      ...cleanedTemplate,
      code
    }));

    // 4. Single batch insert into MongoDB using insertMany
    const createdCoupons = await Coupon.insertMany(docsToInsert, { ordered: false, lean: true });

    res.status(201).json({
      created: createdCoupons.length,
      errors: targetCount - createdCoupons.length,
      errorMessages: targetCount > createdCoupons.length ? [`Failed to create ${targetCount - createdCoupons.length} coupons`] : [],
      coupons: createdCoupons
    });
  } catch (error) {
    const insertedDocs = error.insertedDocs || [];
    if (insertedDocs.length > 0) {
      return res.status(201).json({
        created: insertedDocs.length,
        errors: (parseInt(req.body.count, 10) || 0) - insertedDocs.length,
        errorMessages: [error.message],
        coupons: insertedDocs
      });
    }
    res.status(500).json({ message: error.message || 'Error bulk creating coupons' });
  }
};
