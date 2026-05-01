/**
 * Reminder Scheduler Job
 * Periodically checks for pending reminders and executes them
 */

const reminderService = require('../services/reminderService');
const reminderController = require('../controllers/reminderController');
const logger = require('../utils/logger');
const config = require('../config');

let schedulerInterval;
let botInstance;

/**
 * Start the reminder scheduler
 * @param {object} bot - Telegraf bot instance
 */
const startReminderScheduler = (bot) => {
  botInstance = bot;

  if (schedulerInterval) {
    logger.warn('Reminder scheduler already running');
    return;
  }

  logger.info('Starting reminder scheduler', {
    checkInterval: config.jobs.checkInterval
  });

  schedulerInterval = setInterval(async () => {
    try {
      await checkAndExecuteReminders();
    } catch (error) {
      logger.error('Reminder scheduler error', error);
    }
  }, config.jobs.checkInterval);
};

/**
 * Check for pending reminders and execute them
 */
const checkAndExecuteReminders = async () => {
  try {
    const pendingReminders = await reminderService.getPendingReminders();

    if (pendingReminders.length === 0) {
      return;
    }

    logger.debug('Processing pending reminders', {
      count: pendingReminders.length
    });

    for (const reminder of pendingReminders) {
      try {
        // Notify user about reminder
        await reminderController.notifyReminderExecution(
          reminder.chatId,
          reminder,
          botInstance
        );

        // Mark as executed
        await reminderService.executeReminder(reminder.id);

        logger.info('Reminder executed', {
          reminderId: reminder.id,
          userId: reminder.userId
        });
      } catch (error) {
        logger.error('Failed to execute reminder', {
          reminderId: reminder.id,
          error: error.message
        });
      }
    }
  } catch (error) {
    logger.error('Error checking reminders', error);
  }
};

/**
 * Stop the reminder scheduler
 */
const stopReminderScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Reminder scheduler stopped');
  }
};

/**
 * Get scheduler status
 */
const getSchedulerStatus = () => {
  return {
    running: !!schedulerInterval,
    interval: config.jobs.checkInterval
  };
};

module.exports = {
  startReminderScheduler,
  stopReminderScheduler,
  checkAndExecuteReminders,
  getSchedulerStatus
};
