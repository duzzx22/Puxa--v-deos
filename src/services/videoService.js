/**
 * Video Download Service
 * Handles video downloading from multiple platforms using youtube-dl-exec
 */

const fs = require('fs').promises;
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const config = require('../config');
const logger = require('../utils/logger');
const { detectPlatform, isValidUrl, retryWithExponentialBackoff } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../utils/constants');

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
 * Download video using youtube-dl exec wrapper
 * @param {string} url - Video URL
 * @param {string} platform - Detected platform
 * @returns {Promise<object>}
 */
const downloadWithYoutubeDl = async (url, platform) => {
  await ensureTempDir();
  const outputPath = generateTempFilePath(platform, 'mp4');

  const options = {
    output: outputPath,
    format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
    mergeOutputFormat: 'mp4',
    preferFreeFormats: true,
    noWarnings: true,
    noCallHome: true,
    quiet: true,
    nocheckcertificate: true,
    youtubeSkipDashManifest: true
  };

  await retryWithExponentialBackoff(async () => {
    logger.info('Downloading media using youtube-dl', { url, platform, outputPath });
    await youtubedl(url, options);
  });

  try {
    await fs.access(outputPath);
    return {
      filePath: outputPath,
      platform
    };
  } catch (error) {
    logger.error('Downloaded file was not found', error);
    throw new Error(ERROR_MESSAGES.DOWNLOAD_FAILED);
  }
};

/**
 * Download video from a supported URL
 * @param {string} url - Video URL
 * @returns {Promise<object>} - { filePath, platform }
 */
const downloadVideo = async (url) => {
  if (!url || !isValidUrl(url)) {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }

  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
  }

  if (!config.integrations[platform]) {
    throw new Error(ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED);
  }

  return downloadWithYoutubeDl(url, platform);
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
  cleanupTempFile,
  generateTempFilePath,
  ensureTempDir
};
