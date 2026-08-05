import Faq from '../models/Faq.js';

export const getFaqs = async (req, res) => {
  try {
    const { page } = req.query;
    const filter = { isActive: true };
    if (page) {
      filter.page = page;
    }
    const faqs = await Faq.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getAllFaqs = async (req, res) => {
  try {
    // Admin route to get all, including inactive
    const faqs = await Faq.find().sort({ page: 1, order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    console.error('Error fetching all FAQs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { question, answer, page, order, isActive } = req.body;
    const faq = new Faq({ question, answer, page, order, isActive });
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, page, order, isActive } = req.body;
    const faq = await Faq.findByIdAndUpdate(
      id,
      { question, answer, page, order, isActive },
      { new: true }
    );
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
