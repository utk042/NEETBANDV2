import jwt from 'jsonwebtoken';
import { MAX_ACTIVE_TOKENS, REPLACED_TOKEN_GRACE_PERIOD_MS } from '../config/constants.js';

// In-memory cache for tokens that were replaced during sliding refresh.
// Maps oldToken -> { newToken, expiresAt }
const recentlyReplacedTokens = new Map();

// Periodic cleanup of expired entries in grace period cache (every 60s)
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [token, data] of recentlyReplacedTokens.entries()) {
    if (data.expiresAt < now) {
      recentlyReplacedTokens.delete(token);
    }
  }
}, 60000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Filter out expired JWT tokens from a list of tokens.
 */
export const filterExpiredTokens = (tokens) => {
  if (!Array.isArray(tokens)) return [];
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return tokens.filter((token) => {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return decoded.exp > nowInSeconds;
      }
      return true; // Keep if cannot decode exp
    } catch (e) {
      return false;
    }
  });
};

/**
 * Clean up expired tokens directly in the MongoDB document.
 */
export const cleanupExpiredTokensInDb = async (Model, id) => {
  const doc = await Model.findById(id).select('+activeTokens');
  if (!doc || !Array.isArray(doc.activeTokens)) return;

  const validTokens = filterExpiredTokens(doc.activeTokens);
  if (validTokens.length !== doc.activeTokens.length) {
    await Model.findByIdAndUpdate(id, {
      $set: { activeTokens: validTokens }
    });
  }
};

/**
 * Add a new token atomically to activeTokens, enforcing MAX_ACTIVE_TOKENS limit (Max 2).
 */
export const addActiveTokenAtomic = async (Model, id, newToken) => {
  // 1. Clean up expired tokens first
  await cleanupExpiredTokensInDb(Model, id);

  // 2. Atomically push newToken and slice to keep only the last MAX_ACTIVE_TOKENS (2)
  await Model.findByIdAndUpdate(id, {
    $push: {
      activeTokens: {
        $each: [newToken],
        $slice: -MAX_ACTIVE_TOKENS
      }
    }
  });
};

/**
 * Replace an old token with a new token during sliding refresh, maintaining a grace period for in-flight requests.
 */
export const replaceActiveTokenAtomic = async (Model, id, oldToken, newToken) => {
  // Store oldToken in grace period cache
  recentlyReplacedTokens.set(oldToken, {
    newToken,
    expiresAt: Date.now() + REPLACED_TOKEN_GRACE_PERIOD_MS
  });

  const doc = await Model.findById(id).select('+activeTokens');
  if (!doc) return;

  let currentTokens = filterExpiredTokens(doc.activeTokens || []);
  const oldIndex = currentTokens.indexOf(oldToken);

  if (oldIndex !== -1) {
    // Replace old token in-place
    currentTokens[oldIndex] = newToken;
  } else {
    // Append if old token was somehow missing
    currentTokens.push(newToken);
  }

  // Ensure limit is strictly capped at MAX_ACTIVE_TOKENS (2)
  if (currentTokens.length > MAX_ACTIVE_TOKENS) {
    currentTokens = currentTokens.slice(-MAX_ACTIVE_TOKENS);
  }

  await Model.findByIdAndUpdate(id, {
    $set: { activeTokens: currentTokens }
  });
};

/**
 * Atomically remove a specific token on logout.
 */
export const removeActiveTokenAtomic = async (Model, id, token) => {
  await Model.findByIdAndUpdate(id, {
    $pull: { activeTokens: token }
  });
  recentlyReplacedTokens.delete(token);
};

/**
 * Check if a token is active or currently within its sliding refresh grace period.
 */
export const isTokenActive = (activeTokens, token) => {
  // Check if token is directly in activeTokens
  if (Array.isArray(activeTokens) && activeTokens.includes(token)) {
    return true;
  }

  // Check if token is in grace period cache
  const graceData = recentlyReplacedTokens.get(token);
  if (graceData && graceData.expiresAt > Date.now()) {
    return true;
  }

  return false;
};
