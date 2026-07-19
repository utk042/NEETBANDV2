import AdConfig from '../models/AdConfig.js';

// Get the global Ad Config
export const getAdConfig = async (req, res) => {
  try {
    let config = await AdConfig.findOne();
    if (!config) {
      // Create default if it doesn't exist
      config = await AdConfig.create({});
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching ad config:', error);
    res.status(500).json({ error: 'Failed to fetch ad config' });
  }
};

// Update the global Ad Config
export const updateAdConfig = async (req, res) => {
  try {
    const { audioRollPositions, audioRollUrl, popupPositions, popupHtml } = req.body;
    
    let config = await AdConfig.findOne();
    if (!config) {
      config = new AdConfig();
    }

    if (audioRollPositions !== undefined) config.audioRollPositions = audioRollPositions;
    if (audioRollUrl !== undefined) config.audioRollUrl = audioRollUrl;
    if (popupPositions !== undefined) config.popupPositions = popupPositions;
    if (popupHtml !== undefined) config.popupHtml = popupHtml;

    await config.save();
    res.json(config);
  } catch (error) {
    console.error('Error updating ad config:', error);
    res.status(500).json({ error: 'Failed to update ad config' });
  }
};
