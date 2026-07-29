import AdConfig from '../models/AdConfig.js';

// Get the global Ad Config
export const getAdConfig = async (req, res) => {
  try {
    const config = await AdConfig.findOneAndUpdate(
      {},
      {},
      { upsert: true, returnDocument: 'after', new: true, setDefaultsOnInsert: true }
    );
    res.json(config);
  } catch (error) {
    console.error('Error fetching ad config:', error);
    res.status(500).json({ error: 'Failed to fetch ad config' });
  }
};

// Update the global Ad Config
export const updateAdConfig = async (req, res) => {
  try {
    const { version, audioRollPositions, audioRollUrl, popupPositions, popupHtml, guestAdUrl, audioRollsEnabled, popupsEnabled, adBannerText, adTextColor } = req.body;
    
    let config = await AdConfig.findOne();
    if (!config) {
      config = new AdConfig();
      await config.save();
    }
    
    // Early version check before attempting update
    if (version !== undefined && version !== null && config.__v !== version) {
      return res.status(409).json({ error: 'Ad configuration was updated by another user. Please refresh and try again.' });
    }

    const validatePositions = (arr) => {
      if (!Array.isArray(arr)) return false;
      return arr.every(p => typeof p === 'number' && Number.isInteger(p) && p >= 0 && p <= 100);
    };

    const updateDoc = { $set: {}, $inc: { __v: 1 } };

    if (audioRollPositions !== undefined) {
      if (!validatePositions(audioRollPositions)) {
        return res.status(400).json({ error: 'Audio roll positions must be an array of integers between 0 and 100.' });
      }
      updateDoc.$set.audioRollPositions = Array.from(new Set(audioRollPositions)).sort((a, b) => a - b);
    }
    if (audioRollUrl !== undefined) updateDoc.$set.audioRollUrl = audioRollUrl;

    if (popupPositions !== undefined) {
      if (!validatePositions(popupPositions)) {
        return res.status(400).json({ error: 'Popup positions must be an array of integers between 0 and 100.' });
      }
      updateDoc.$set.popupPositions = Array.from(new Set(popupPositions)).sort((a, b) => a - b);
    }
    if (popupHtml !== undefined) updateDoc.$set.popupHtml = popupHtml;
    if (guestAdUrl !== undefined) updateDoc.$set.guestAdUrl = guestAdUrl === '' ? '/uploads/post_roll_ad.mp3' : guestAdUrl;
    if (audioRollsEnabled !== undefined) updateDoc.$set.audioRollsEnabled = audioRollsEnabled;
    if (popupsEnabled !== undefined) updateDoc.$set.popupsEnabled = popupsEnabled;
    if (adBannerText !== undefined) updateDoc.$set.adBannerText = adBannerText;
    if (adTextColor !== undefined) updateDoc.$set.adTextColor = adTextColor;

    // If updateDoc.$set is empty, we still increment version, which is fine, but maybe unnecessary.
    
    const expectedVersion = (version !== undefined && version !== null) ? version : config.__v;

    const updatedConfig = await AdConfig.findOneAndUpdate(
      { _id: config._id, __v: expectedVersion },
      updateDoc,
      { new: true, runValidators: true }
    );

    if (!updatedConfig) {
      return res.status(409).json({ error: 'Ad configuration was updated by another user. Please refresh and try again.' });
    }

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating ad config:', error);
    res.status(500).json({ error: 'Failed to update ad config' });
  }
};
