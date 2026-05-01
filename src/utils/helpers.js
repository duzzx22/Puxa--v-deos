/**
 * Helper Utils Module
 * Utility functions for date/time, parsing, validation, etc
 */

const { TIME_UNITS, PLATFORM_PATTERNS } = require('./constants');
const logger = require('./logger');

/**
 * Get current date/time in configured timezone
 * @param {string} timezone - Timezone (e.g., 'America/Sao_Paulo')
 * @returns {object} - { date, time, formatted }
 */
const getDateTimeFormatted = (timezone = 'UTC') => {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const date = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  const time = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;

  return {
    date,
    time,
    formatted: `${date} ${time}`,
    timestamp: Date.now()
  };
};

/**
 * Parse time string (e.g., "10m" -> 600000ms)
 * @param {string} timeStr - Time string (e.g., "10m", "2h", "30s")
 * @returns {number} - Milliseconds or null if invalid
 */
const parseTimeString = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const match = timeStr.toLowerCase().match(/^(\d+)([smh])$/);
  if (!match) return null;

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  if (unit === TIME_UNITS.SECONDS) return numValue * 1000;
  if (unit === TIME_UNITS.MINUTES) return numValue * 60 * 1000;
  if (unit === TIME_UNITS.HOURS) return numValue * 60 * 60 * 1000;

  return null;
};

/**
 * Detect video platform from URL
 * @param {string} url - Video URL
 * @returns {string|null} - Platform key or null
 */
const detectPlatform = (url) => {
  if (!url || typeof url !== 'string') return null;

  for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return platform;
      }
    }
  }

  return null;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract command and arguments from message text
 * @param {string} text - Message text
 * @returns {object} - { command, args }
 */
const parseCommand = (text) => {
  if (!text) return { command: null, args: [] };

  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return {
    command,
    args,
    rawText: text
  };
};

/**
 * Truncate text to Telegram's message length limit
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Max length (default 4096)
 * @returns {string}
 */
const truncateText = (text, maxLength = 4096) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Delay execution (async)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitize username for safe operations
 * @param {string} username - Username to sanitize
 * @returns {string}
 */
const sanitizeUsername = (username) => {
  if (!username) return 'anonymous';
  return username.replace(/[^a-zA-Z0-9_-]/g, '');
};

/**
 * Generate unique ID
 * @returns {string}
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Max retry attempts (default 3)
 * @param {number} delayMs - Initial delay in ms (default 1000)
 * @returns {Promise}
 */
const retryWithExponentialBackoff = async (fn, maxAttempts = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`, { error: error.message });

      if (attempt < maxAttempts) {
        await delay(delayMs);
        delayMs *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};

module.exports = {
  getDateTimeFormatted,
  parseTimeString,
  detectPlatform,
  isValidUrl,
  parseCommand,
  truncateText,
  formatFileSize,
  delay,
  sanitizeUsername,
  generateId,
  retryWithExponentialBackoff
};
