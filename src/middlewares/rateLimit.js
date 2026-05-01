/**
 * Rate Limiting Middleware
 * Prevents abuse with per-user request throttling
 */

const config = require('../config');
const logger = require('../utils/logger');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * In-memory rate limit store
 * Structure: { userId: { count: number, resetTime: timestamp } }
 */
const rateLimitStore = new Map();

/**
 * Clean up expired entries (periodic cleanup)
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();

  for (const [userId, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(userId);
    }
  }
};

/**
 * Run cleanup every 60 seconds
 */
setInterval(cleanupExpiredEntries, 60000);

/**
 * Check if user is rate limited
 * @param {number} userId - Telegram user ID
 * @returns {boolean}
 */
const isRateLimited = (userId) => {
  if (!config.rateLimit.enabled) return false;

  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit) {
    // First request
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    return false;
  }

  if (now >= userLimit.resetTime) {
    // Window expired, reset
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    return false;
  }

  // Within window
  userLimit.count++;

  if (userLimit.count > config.rateLimit.maxRequests) {
    logger.warn(`Rate limit exceeded for user ${userId}`, {
      requests: userLimit.count,
      limit: config.rateLimit.maxRequests,
    });
    return true;
  }

  return false;
};

/**
 * Middleware: Apply rate limiting
 */
const rateLimitMiddleware = async (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId) {
    return next();
  }

  if (isRateLimited(userId)) {
    return ctx.reply(ERROR_MESSAGES.RATE_LIMIT);
  }

  return next();
};

/**
 * Reset rate limit for user
 * @param {number} userId - Telegram user ID
 */
const resetUserRateLimit = (userId) => {
  rateLimitStore.delete(userId);
  logger.info(`Rate limit reset for user ${userId}`);
};

/**
 * Get rate limit info for user
 * @param {number} userId - Telegram user ID
 * @returns {object|null}
 */
const getRateLimitInfo = (userId) => {
  return rateLimitStore.get(userId) || null;
};

module.exports = {
  isRateLimited,
  rateLimitMiddleware,
  resetUserRateLimit,
  getRateLimitInfo,
};
