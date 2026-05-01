/**
 * Main Bot File
 * Initializes Telegraf bot with all handlers, middlewares and features
 */

require('dotenv').config();

const { Telegraf } = require('telegraf');
const config = require('./config');
const logger = require('./utils/logger');

// Middlewares
const { verifyUserAccess, requireAdmin } = require('./middlewares/auth');
const { rateLimitMiddleware } = require('./middlewares/rateLimit');

// Controllers
const { handleVideoCommand } = require('./controllers/videoController');
const { handleAudioCommand } = require('./controllers/audioController');
const {
  handleReminderCommand,
  handleRemindersListCommand,
  handleCancelReminderCommand,
} = require('./controllers/reminderController');
const {
  handleClearCommand,
  handleBanCommand,
  handleUnbanCommand,
} = require('./controllers/chatController');
const {
  handleDateCommand,
  handleStartCommand,
  handleHelpCommand,
  handleStatusCommand,
} = require('./controllers/utilityController');

// Jobs
const { startReminderScheduler, stopReminderScheduler } = require('./jobs/reminderScheduler');

// ============================================
// BOT INITIALIZATION
// ============================================

let bot;

/**
 * Initialize and start the bot
 */
const initializeBot = async () => {
  try {
    // Create bot instance
    bot = new Telegraf(config.bot.token);

    logger.info('🤖 Bot initialized with Telegraf', {
      botUsername: config.bot.token.substring(0, 10) + '***',
    });

    // ============================================
    // GLOBAL MIDDLEWARES
    // ============================================

    // User verification and access control
    bot.use(async (ctx, next) => {
      try {
        await verifyUserAccess(ctx, next);
      } catch (error) {
        logger.error('Auth middleware error', error);
        ctx.reply('❌ Erro ao processar sua requisição');
      }
    });

    // Rate limiting
    bot.use(rateLimitMiddleware);

    // ============================================
    // COMMAND HANDLERS
    // ============================================

    // 🎬 Media commands
    bot.command('video', handleVideoCommand);
    bot.command('audio', handleAudioCommand);

    // ⏰ Reminder commands
    bot.command('remind', handleReminderCommand);
    bot.command('reminders', handleRemindersListCommand);
    bot.command('cancel', handleCancelReminderCommand);

    // 🧹 Chat management (admin only)
    bot.command('clear', requireAdmin, handleClearCommand);
    bot.command('ban', requireAdmin, handleBanCommand);
    bot.command('unban', requireAdmin, handleUnbanCommand);

    // 📅 Utility commands
    bot.command('date', handleDateCommand);
    bot.command('start', handleStartCommand);
    bot.command('help', handleHelpCommand);
    bot.command('status', handleStatusCommand);

    // ============================================
    // ERROR HANDLING
    // ============================================

    bot.catch((err, ctx) => {
      logger.error('Bot error caught by error handler', {
        error: err.message,
        stack: err.stack,
        userId: ctx.from?.id,
      });
      ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.');
    });

    // ============================================
    // LAUNCH BOT
    // ============================================

    if (config.env === 'production' && config.bot.webhookUrl) {
      // Webhook mode for production
      await bot.telegram.setWebhook(config.bot.webhookUrl);
      logger.info('🚀 Bot running in webhook mode', {
        webhookUrl: config.bot.webhookUrl,
      });
    } else {
      // Polling mode for development
      logger.info('🚀 Bot starting in polling mode...');
      await bot.launch();
      logger.info('✅ Bot is running in polling mode');
    }

    // ============================================
    // START BACKGROUND JOBS
    // ============================================

    startReminderScheduler(bot);

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================

    process.once('SIGINT', () => {
      logger.info('📴 Received SIGINT, shutting down gracefully...');
      stopReminderScheduler();
      bot.stop('SIGINT');
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      logger.info('📴 Received SIGTERM, shutting down gracefully...');
      stopReminderScheduler();
      bot.stop('SIGTERM');
      process.exit(0);
    });

    return bot;
  } catch (error) {
    logger.error('❌ Failed to initialize bot', error);
    throw error;
  }
};

/**
 * Get bot instance
 */
const getBot = () => bot;

/**
 * Express middleware for webhook mode
 */
const getWebhookMiddleware = () => {
  if (!bot) {
    throw new Error('Bot not initialized');
  }
  return bot.webhookCallback('/webhook');
};

module.exports = {
  initializeBot,
  getBot,
  getWebhookMiddleware,
};
