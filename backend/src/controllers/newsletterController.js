import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'This email is already subscribed.' });
    }
    const newSubscriber = await NewsletterSubscriber.create({ email });
    res.status(201).json(newSubscriber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    
    const existing = await NewsletterSubscriber.findOne({ 
      email: email.toLowerCase().trim(),
      _id: { $ne: req.params.id }
    });
    if (existing) {
      return res.status(400).json({ message: 'This email is already subscribed.' });
    }

    const subscriber = await NewsletterSubscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    subscriber.email = email;
    await subscriber.save();
    res.status(200).json(subscriber);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    res.status(200).json({ message: 'Subscriber deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
