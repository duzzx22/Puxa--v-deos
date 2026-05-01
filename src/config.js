/**
 * Configuration Module
 * Centralized configuration with validation and defaults
 */

require('dotenv').config();
const path = require('path');

const parseIdList = (value, name) => {
  return (value || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .reduce((result, id) => {
      if (!/^[0-9]+$/.test(id)) {
        console.warn(`⚠️  Invalid ${name} value ignored: "${id}"`);
        return result;
      }
      result.push(Number(id));
      return result;
    }, []);
};

const config = {
  // ===== BOT =====
  bot: {
    token: process.env.BOT_TOKEN,
    webhookUrl: process.env.WEBHOOK_URL,
    webhookPort: parseInt(process.env.WEBHOOK_PORT, 10) || 3000
  },

  // ===== SECURITY =====
  security: {
    blacklistUsers: parseIdList(process.env.BLACKLIST_USERS, 'BLACKLIST_USERS')
  },

  // ===== RATE LIMITING =====
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 10000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5
  },

  // ===== REMINDERS & JOBS =====
  jobs: {
    checkInterval: parseInt(process.env.REMINDER_CHECK_INTERVAL, 10) || 5000,
    remindersFile: process.env.REMINDERS_FILE || path.join(__dirname, '..', 'data', 'reminders.json')
  },

  // ===== FILE HANDLING =====
  files: {
    tempDir: process.env.TEMP_DIR || path.join(__dirname, '..', '..', 'temp'),
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
    downloadTimeout: parseInt(process.env.DOWNLOAD_TIMEOUT_MS, 10) || 30000
  },

  // ===== TIMEZONE =====
  timezone: process.env.TIMEZONE || 'UTC',

  // ===== LOGGING =====
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '..', '..', 'logs', 'bot.log'),
    maxSize: parseInt(process.env.LOG_MAX_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 5
  },

  // ===== VIDEO DOWNLOAD =====
  integrations: {
    tiktok: process.env.ENABLE_TIKTOK === 'true',
    instagram: process.env.ENABLE_INSTAGRAM === 'true',
    youtube: process.env.ENABLE_YOUTUBE === 'true',
    twitter: process.env.ENABLE_TWITTER === 'true',
    rapidApiKey: process.env.RAPIDAPI_KEY,
    tiktokApiUrl: process.env.TIKTOK_API_URL,
    instagramApiUrl: process.env.INSTAGRAM_API_URL
  },

  // ===== ENVIRONMENT =====
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true' || false
};

/**
 * Validate critical configurations
 */
const validateConfig = () => {
  if (!config.bot.token) {
    throw new Error('BOT_TOKEN is not configured in environment variables');
  }
};

validateConfig();

module.exports = config;
