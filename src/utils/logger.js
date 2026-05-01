/**
 * Structured Logging Module
 * Uses Winston for professional logging with rotation support
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Custom format for logs with timestamps and metadata
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      log += ` | ${JSON.stringify(metadata)}`;
    }
    return log;
  })
);

/**
 * Create the logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: config.logging.level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File transport for persistence
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      level: config.logging.level
    }),

    // Error file for error-only logs
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'error.log'),
      level: 'error',
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles
    })
  ]
});

/**
 * Convenience methods with context
 */
logger.withContext = (context) => ({
  info: (message, data = {}) => logger.info(message, { meta: { context, ...data } }),
  warn: (message, data = {}) => logger.warn(message, { meta: { context, ...data } }),
  error: (message, error = {}) =>
    logger.error(message, { meta: { context, error: error.message || error, stack: error.stack } }),
  debug: (message, data = {}) => logger.debug(message, { meta: { context, ...data } })
});

module.exports = logger;
