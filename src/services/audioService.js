/**
 * Audio Extraction Service
 * Handles audio extraction from video files using FFmpeg
 */

const path = require('path');
const logger = require('../utils/logger');
const { AUDIO_CONFIG } = require('../utils/constants');

let ffmpeg;

try {
  ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegPath);
} catch (error) {
  logger.warn('FFmpeg not available - audio extraction will not work', error);
}

/**
 * Generate output file path for audio
 * @param {string} videoPath - Original video file path
 * @returns {string}
 */
const generateAudioPath = (videoPath) => {
  const dir = path.dirname(videoPath);
  const name = path.basename(videoPath, path.extname(videoPath));
  return path.join(dir, `${name}_audio.${AUDIO_CONFIG.FORMAT}`);
};

/**
 * Extract audio from video file
 * @param {string} videoPath - Path to video file
 * @param {object} options - Extraction options
 * @returns {Promise<string>} - Path to extracted audio file
 */
const extractAudio = async (videoPath, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      return reject(new Error('FFmpeg not available - install ffmpeg-static or system FFmpeg'));
    }

    const outputPath = options.outputPath || generateAudioPath(videoPath);
    const bitrate = options.bitrate || AUDIO_CONFIG.BITRATE;
    const sampleRate = options.sampleRate || AUDIO_CONFIG.SAMPLE_RATE;
    const channels = options.channels || AUDIO_CONFIG.CHANNELS;

    logger.info('Audio extraction started', {
      input: videoPath,
      output: outputPath,
      bitrate
    });

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(bitrate)
      .audioFrequency(sampleRate)
      .audioChannels(channels)
      .on('start', (cmdline) => {
        logger.debug('FFmpeg command started', { cmdline });
      })
      .on('progress', (progress) => {
        logger.debug('Audio extraction progress', {
          timemark: progress.timemark,
          percent: Math.round(progress.percent)
        });
      })
      .on('end', () => {
        logger.info('Audio extraction completed', { outputPath });
        resolve(outputPath);
      })
      .on('error', (error) => {
        logger.error('Audio extraction failed', error);
        reject(new Error(`Audio extraction failed: ${error.message}`));
      })
      .save(outputPath);
  });
};

/**
 * Extract audio from URL (download first, then extract)
 * @param {string} videoUrl - Video URL
 * @param {object} options - Extraction options
 * @returns {Promise<string>} - Path to extracted audio file
 */
const extractAudioFromUrl = async (videoUrl, options = {}) => {
  const videoService = require('./videoService');

  try {
    // Download video first
    logger.info('Downloading video for audio extraction', { url: videoUrl });
    const videoInfo = await videoService.downloadVideo(videoUrl);

    if (!videoInfo || !videoInfo.filePath) {
      throw new Error('Video download failed');
    }

    // Extract audio
    const audioPath = await extractAudio(videoInfo.filePath, options);

    // Clean up video file after extraction
    await videoService.cleanupTempFile(videoInfo.filePath);

    return audioPath;
  } catch (error) {
    logger.error('Audio extraction from URL failed', error);
    throw error;
  }
};

/**
 * Get audio file info
 * @param {string} filePath - Audio file path
 * @returns {Promise<object>} - File info (size, duration, etc)
 */
const getAudioInfo = async (filePath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpeg) {
      return reject(new Error('FFmpeg not available'));
    }

    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error('Failed to get audio info', err);
        return reject(err);
      }

      const duration = metadata.format.duration;
      const size = metadata.format.size;

      resolve({
        duration: Math.round(duration),
        size,
        bitrate: metadata.format.bit_rate,
        format: path.extname(filePath).substr(1)
      });
    });
  });
};

/**
 * Validate audio file
 * @param {string} filePath - Audio file path
 * @returns {Promise<boolean>}
 */
const validateAudioFile = async (filePath) => {
  try {
    const info = await getAudioInfo(filePath);
    logger.info('Audio file validated', { filePath, info });
    return true;
  } catch (error) {
    logger.error('Audio file validation failed', error);
    return false;
  }
};

module.exports = {
  extractAudio,
  extractAudioFromUrl,
  getAudioInfo,
  validateAudioFile,
  generateAudioPath
};
