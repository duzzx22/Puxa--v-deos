/**
 * Video Download Controller
 * Handles /video command
 */

const videoService = require('../services/videoService');
const logger = require('../utils/logger');
const { logUserAction } = require('../middlewares/auth');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const { isValidUrl } = require('../utils/helpers');

/**
 * Handle /video command
 * @param {object} ctx - Telegraf context
 */
const handleVideoCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);
  const url = args?.[0];

  logUserAction(ctx, 'VIDEO_COMMAND', { url: url?.substring(0, 50) });

  try {
    // Validation
    if (!url || !isValidUrl(url)) {
      return ctx.reply(ERROR_MESSAGES.INVALID_URL);
    }

    // Send processing message
    const processingMsg = await ctx.reply(SUCCESS_MESSAGES.DOWNLOAD_STARTED);

    logger.info('Download starting', { url, userId, messageId: processingMsg.message_id });

    // Download video
    const videoInfo = await videoService.downloadVideo(url);

    // Send video to user
    await ctx.replyWithVideo(
      { source: videoInfo.filePath },
      {
        caption: `✅ Vídeo baixado com sucesso!\n📱 Plataforma: ${videoInfo.platform}`,
        reply_to_message_id: ctx.message.message_id,
      }
    );

    // Delete processing message
    try {
      await ctx.deleteMessage(processingMsg.message_id);
    } catch (error) {
      logger.debug('Could not delete processing message', { error: error.message });
    }

    // Cleanup temp file
    await videoService.cleanupTempFile(videoInfo.filePath);

    logger.info('Download completed successfully', { url, userId });
  } catch (error) {
    logger.error('Video download failed', error);

    const errorMsg = error.message?.includes('not configured')
      ? ERROR_MESSAGES.PLATFORM_NOT_SUPPORTED
      : ERROR_MESSAGES.DOWNLOAD_FAILED;

    ctx.reply(errorMsg, { reply_to_message_id: ctx.message.message_id });
  }
};

module.exports = {
  handleVideoCommand,
};
