/**
 * Video Download Service
 * Handles video downloading from multiple platforms
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { detectPlatform, isValidUrl, retryWithExponentialBackoff } = require('../utils/helpers');
const { VIDEO_PLATFORMS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Create temp directory if it doesn't exist
 */
const ensureTempDir = async () => {
  try {
    const stat = await fs.stat(config.files.tempDir);
    if (!stat.isDirectory()) {
      throw new Error(`${config.files.tempDir} exists but is not a directory`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(config.files.tempDir, { recursive: true });
    } else {
      throw error;
    }
  }
};

/**
 * Generate unique temp file path
 * @param {string} platform - Video platform
 * @param {string} ext - File extension
 * @returns {string}
 */
const generateTempFilePath = (platform, ext = 'mp4') => {
  const filename = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
  return path.join(config.files.tempDir, filename);
};

/**
 * Download file from URL and save to disk
 * @param {string} url - File URL
 * @param {string} filePath - Target file path
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Promise<void>}
 */
const downloadFile = async (url, filePath, maxSize = config.files.maxFileSizeMB * 1024 * 1024) => {
  return retryWithExponentialBackoff(async () => {
    try {
      const response = await axios.get(url, {
        timeout: config.files.downloadTimeout,
        responseType: 'stream',
        maxContentLength: maxSize
      });

      // Check file size before downloading
      const contentLength = parseInt(response.headers['content-length'], 10);
      if (contentLength && contentLength > maxSize) {
        throw new Error(`File too large: ${contentLength} bytes (max: ${maxSize})`);
      }

      await ensureTempDir();

      return new Promise((resolve, reject) => {
        const writer = require('fs').createWriteStream(filePath);
        let downloadedSize = 0;

        response.data.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (downloadedSize > maxSize) {
            writer.destroy();
            reject(new Error('File download exceeded maximum size'));
          }
        });

        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', (err) => {
          reject(new Error(`Download failed: ${err.message}`));
        });
      });
    } catch (error) {
      logger.error('File download failed', error);
      throw error;
    }
  });
};

/**
 * Download from TikTok
 * Strategy: Try API first, fallback to scraping
 */
const downloadFromTikTok = async (url) => {
  logger.info('Downloading from TikTok', { url });

  try {
    // Retry strategy
    return await retryWithExponentialBackoff(async () => {
      // Try using a public API endpoint (simplified for example)
      // In production, use a real API like:
      // - TikMate API
      // - Snaptik API
      // - Custom scraper with puppeteer

      throw new Error('TikTok API not configured - implement with actual service');
    }, 2, 1000);
  } catch (error) {
    logger.error('TikTok download failed', error);
    throw new Error(ERROR_MESSAGES.DOWNLOAD_FAILED);
  }
};

/**
 * Download from Instagram
 */
const downloadFromInstagram = async (url) => {
  logger.info('Downloading from Instagram', { url });

  try {
    return await retryWithExponentialBackoff(async () => {
      // Implement Instagram download
      // Use: instagrapi library or API service
      throw new Error('Instagram API not configured - implement with actual service');
    }, 2, 1000);
  } catch (error) {
    logger.error('Instagram download failed', error);
    throw new Error(ERROR_MESSAGES.DOWNLOAD_FAILED);
  }
};

/**
 * Download from YouTube
 */
const downloadFromYouTube = async (url) => {
  logger.info('Downloading from YouTube', { url });

  try {
    await ensureTempDir();

    // Using yt-dlp for downloading
    // Command: yt-dlp -f best -o {output} {url}

    return await retryWithExponentialBackoff(async () => {
      throw new Error('YouTube download not configured - implement with yt-dlp');
    }, 2, 1000);
  } catch (error) {
    logger.error('YouTube download failed', error);
    throw new Error(ERROR_MESSAGES.DOWNLOAD_FAILED);
  }
};

/**
 * Download from Twitter/X
 */
const downloadFromTwitter = async (url) => {
  logger.info('Downloading from Twitter', { url });

  try {
    return await retryWithExponentialBackoff(async () => {
      // Implement Twitter download using:
      // - twitter-api
      // - scraper library
      throw new Error('Twitter API not configured - implement with actual service');
    }, 2, 1000);
  } catch (error) {
    logger.error('Twitter download failed', error);
    throw new Error(ERROR_MESSAGES.DOWNLOAD_FAILED);
  }
};

/**
 * Main download handler
 * @param {string} url - Video URL
 * @returns {Promise<object>} - { filePath, platform, duration }
 */
const downloadVideo = async (url) => {
  // Validation
  if (!url || !isValidUrl(url)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }

  // Platform detection
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
  }

  logger.info('Download initiated', { url, platform });

  // Route to platform-specific handler
  switch (platform) {
    case VIDEO_PLATFORMS.TIKTOK:
      if (!config.integrations.tiktok) throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
      return await downloadFromTikTok(url);

    case VIDEO_PLATFORMS.INSTAGRAM:
      if (!config.integrations.instagram) throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
      return await downloadFromInstagram(url);

    case VIDEO_PLATFORMS.YOUTUBE:
      if (!config.integrations.youtube) throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
      return await downloadFromYouTube(url);

    case VIDEO_PLATFORMS.TWITTER:
      if (!config.integrations.twitter) throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
      return await downloadFromTwitter(url);

    default:
      throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
  }
};

/**
 * Clean up temporary file
 * @param {string} filePath - File path to delete
 * @returns {Promise<void>}
 */
const cleanupTempFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.info('Temp file cleaned up', { filePath });
  } catch (error) {
    logger.warn('Failed to cleanup temp file', { filePath, error: error.message });
  }
};

module.exports = {
  downloadVideo,
  downloadFile,
  cleanupTempFile,
  generateTempFilePath,
  ensureTempDir
};
