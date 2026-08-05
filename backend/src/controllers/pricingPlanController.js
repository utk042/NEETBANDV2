import PricingPlan from '../models/PricingPlan.js';

// @desc    Get all active pricing plans
// @route   GET /api/pricing-plans
// @access  Public
export const getActivePricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find({ isActive: true }).sort({ order: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing plans', error: error.message });
  }
};

// @desc    Get all pricing plans (admin)
// @route   GET /api/pricing-plans/admin
// @access  Private/Admin
export const getAllPricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find({}).sort({ category: 1, order: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing plans', error: error.message });
  }
};

// @desc    Create a new pricing plan
// @route   POST /api/pricing-plans
// @access  Private/Admin
export const createPricingPlan = async (req, res) => {
  try {
    const { category, isActive } = req.body;
    
    // Check limit
    const count = await PricingPlan.countDocuments({ category });
    if (count >= 3) {
      return res.status(400).json({ message: `Maximum 3 plans allowed for category: ${category}` });
    }

    const plan = new PricingPlan(req.body);
    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating pricing plan', error: error.message });
  }
};

// @desc    Update a pricing plan
// @route   PUT /api/pricing-plans/:id
// @access  Private/Admin
export const updatePricingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, category } = req.body;
    
    const plan = await PricingPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }

    // If changing category
    if (category && category !== plan.category) {
      const count = await PricingPlan.countDocuments({ category });
      if (count >= 3) {
         return res.status(400).json({ message: `Maximum 3 plans allowed for category: ${category}` });
      }
    }

    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing plan', error: error.message });
  }
};

// @desc    Delete a pricing plan
// @route   DELETE /api/pricing-plans/:id
// @access  Private/Admin
export const deletePricingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PricingPlan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }

    await PricingPlan.deleteOne({ _id: id });
    res.json({ message: 'Pricing plan removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pricing plan', error: error.message });
  }
};
