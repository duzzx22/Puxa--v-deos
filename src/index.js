/**
 * Application Entry Point
 * Starts the Telegram bot and optional Express server
 */

const logger = require('./utils/logger');
const { initializeBot, getWebhookMiddleware } = require('./bot');
const config = require('./config');

// Optional: Express server for webhook
let app;
let server;

/**
 * Start with webhook (production)
 */
const startWithWebhook = async (bot) => {
  try {
    const express = require('express');
    app = express();

    // Middleware
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Webhook endpoint
    app.post('/webhook', getWebhookMiddleware());

    // Start server
    server = app.listen(config.bot.webhookPort, () => {
      logger.info(`🌐 Express server running on port ${config.bot.webhookPort}`);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start webhook server', error);
    throw error;
  }
};

/**
 * Main entry point
 */
const main = async () => {
  try {
    logger.info('🚀 Starting Puxa Vídeos Bot...', {
      env: config.env,
      timezone: config.timezone,
      version: '1.0.0',
    });

    // Initialize bot
    const bot = await initializeBot();

    // Start webhook or polling
    if (config.env === 'production' && config.bot.webhookUrl) {
      await startWithWebhook(bot);
    }

    logger.info('✅ Bot startup complete', {
      mode: config.env === 'production' ? 'webhook' : 'polling',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('💥 Fatal error during bot startup', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    promise,
  });
});

// Start application
if (require.main === module) {
  main();
}

module.exports = {
  main,
  app,
  server,
};
