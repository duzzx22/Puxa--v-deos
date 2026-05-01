/**
 * Audio Extraction Controller
 * Handles /audio command
 */

const audioService = require('../services/audioService');
const logger = require('../utils/logger');
const { logUserAction } = require('../middlewares/auth');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const { isValidUrl, formatFileSize } = require('../utils/helpers');

/**
 * Handle /audio command
 * @param {object} ctx - Telegraf context
 */
const handleAudioCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);
  const url = args?.[0];

  logUserAction(ctx, 'AUDIO_COMMAND', { url: url?.substring(0, 50) });

  try {
    // Validation
    if (!url || !isValidUrl(url)) {
      return ctx.reply(ERROR_MESSAGES.INVALID_URL);
    }

    // Send processing message
    const processingMsg = await ctx.reply(SUCCESS_MESSAGES.DOWNLOAD_STARTED);

    logger.info('Audio extraction starting', { url, userId });

    // Extract audio
    const audioPath = await audioService.extractAudioFromUrl(url);

    // Get audio info
    const audioInfo = await audioService.getAudioInfo(audioPath);

    // Send audio to user
    await ctx.replyWithAudio(
      { source: audioPath },
      {
        caption: `✅ ${SUCCESS_MESSAGES.AUDIO_EXTRACTED}\n📊 Tamanho: ${formatFileSize(audioInfo.size)}\n⏱️ Duração: ${audioInfo.duration}s`,
        reply_to_message_id: ctx.message.message_id,
      }
    );

    // Delete processing message
    try {
      await ctx.deleteMessage(processingMsg.message_id);
    } catch (error) {
      logger.debug('Could not delete processing message', { error: error.message });
    }

    // Cleanup audio file
    const fs = require('fs').promises;
    try {
      await fs.unlink(audioPath);
    } catch (error) {
      logger.warn('Failed to cleanup audio file', { audioPath, error: error.message });
    }

    logger.info('Audio extraction completed successfully', { url, userId });
  } catch (error) {
    logger.error('Audio extraction failed', error);

    const errorMsg = error.message?.includes('not available')
      ? '❌ FFmpeg não está configurado no servidor'
      : ERROR_MESSAGES.DOWNLOAD_FAILED;

    ctx.reply(errorMsg, { reply_to_message_id: ctx.message.message_id });
  }
};

module.exports = {
  handleAudioCommand,
};
