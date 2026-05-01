/**
 * Authentication Middleware
 * Validates user access and admin permissions
 */

const config = require('../config');
const logger = require('../utils/logger');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Check if user is admin
 * @param {number} userId - Telegram user ID
 * @returns {boolean}
 */
const isAdmin = (userId) => config.security.adminIds.includes(userId);

/**
 * Check if user is blacklisted
 * @param {number} userId - Telegram user ID
 * @returns {boolean}
 */
const isBlacklisted = (userId) => config.security.blacklistUsers.includes(userId);

/**
 * Middleware: Verify user basic access
 * Rejects blacklisted users
 */
const verifyUserAccess = (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId) {
    logger.warn('Request without user ID');
    return ctx.reply(ERROR_MESSAGES.PARSING_ERROR);
  }

  if (isBlacklisted(userId)) {
    logger.warn(`Blocked request from blacklisted user ${userId}`);
    return ctx.reply(ERROR_MESSAGES.USER_BLOCKED);
  }

  ctx.state.userId = userId;
  ctx.state.isAdmin = isAdmin(userId);
  ctx.state.username = ctx.from?.username || 'anonymous';

  return next();
};

/**
 * Middleware: Require admin permission
 */
const requireAdmin = (ctx, next) => {
  const userId = ctx.from?.id;

  if (!isAdmin(userId)) {
    logger.warn(`Unauthorized admin attempt by user ${userId}`);
    return ctx.reply(ERROR_MESSAGES.NO_PERMISSION);
  }

  return next();
};

/**
 * Log user action with context
 * @param {object} ctx - Telegraf context
 * @param {string} action - Action name
 * @param {object} data - Additional data
 */
const logUserAction = (ctx, action, data = {}) => {
  logger.info(`[USER ACTION] ${action}`, {
    userId: ctx.from?.id,
    username: ctx.from?.username,
    chatId: ctx.chat?.id,
    chatType: ctx.chat?.type,
    ...data,
  });
};

module.exports = {
  isAdmin,
  isBlacklisted,
  verifyUserAccess,
  requireAdmin,
  logUserAction,
};
