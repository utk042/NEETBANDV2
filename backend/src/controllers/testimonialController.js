import Testimonial from '../models/Testimonial.js';

// Get all testimonials (admin)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: 'Server error fetching testimonials' });
  }
};

// Get active testimonials (public)
export const getActiveTestimonials = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) {
      filter.type = type;
    }
    const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Error fetching active testimonials:', error);
    res.status(500).json({ success: false, message: 'Server error fetching testimonials' });
  }
};

// Create a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const newTestimonial = new Testimonial(req.body);
    await newTestimonial.save();
    res.status(201).json({ success: true, testimonial: newTestimonial });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ success: false, message: 'Server error creating testimonial', error: error.message });
  }
};

// Update a testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!updatedTestimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    
    res.json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: 'Server error updating testimonial' });
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
    
    if (!deletedTestimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }
    
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: 'Server error deleting testimonial' });
  }
};
