/**
 * Reminders Service
 * Handles reminder business logic and scheduling
 */

const remindersRepository = require('../repositories/remindersRepository');
const logger = require('../utils/logger');
const { parseTimeString, getDateTimeFormatted } = require('../utils/helpers');

/**
 * Create a new reminder
 * @param {number} userId - User ID
 * @param {number} chatId - Chat ID
 * @param {string} timeStr - Time string (e.g., "10m", "2h")
 * @param {string} message - Reminder message
 * @returns {Promise<object>} - Created reminder
 */
const createReminder = async (userId, chatId, timeStr, message) => {
  const delayMs = parseTimeString(timeStr);

  if (!delayMs || delayMs <= 0) {
    throw new Error('Invalid time format. Use: 30s, 10m, 2h');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Reminder message is required');
  }

  const targetTime = Date.now() + delayMs;

  const reminder = await remindersRepository.addReminder({
    userId,
    chatId,
    message: message.trim(),
    targetTime,
    delayMs,
    executed: false,
    createdAt: Date.now(),
  });

  logger.info('Reminder created', {
    reminderId: reminder.id,
    userId,
    delayMs,
    message,
  });

  return reminder;
};

/**
 * List user's reminders
 * @param {number} userId - User ID
 * @returns {Promise<Array>}
 */
const listUserReminders = async (userId) => {
  const reminders = await remindersRepository.getRemindersByUser(userId);

  return reminders
    .map(r => ({
      id: r.id,
      message: r.message,
      createdAt: r.createdAt,
      targetTime: r.targetTime,
      executed: r.executed,
      timeUntil: r.executed ? 'Executed' : formatTimeUntil(r.targetTime),
    }))
    .sort((a, b) => a.targetTime - b.targetTime);
};

/**
 * Format time remaining until reminder
 * @param {number} targetTime - Target timestamp
 * @returns {string}
 */
const formatTimeUntil = (targetTime) => {
  const now = Date.now();
  const diff = Math.max(0, targetTime - now);

  if (diff === 0) return 'Now';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Delete a reminder
 * @param {number} userId - User ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<boolean>}
 */
const deleteReminder = async (userId, reminderId) => {
  const reminder = await remindersRepository.getReminderById(reminderId);

  if (!reminder || reminder.userId !== userId) {
    throw new Error('Reminder not found');
  }

  const result = await remindersRepository.deleteReminder(reminderId);

  if (result) {
    logger.info('Reminder deleted', { reminderId, userId });
  }

  return result;
};

/**
 * Get pending reminders (ready to execute)
 * @returns {Promise<Array>}
 */
const getPendingReminders = async () => {
  return remindersRepository.getPendingReminders();
};

/**
 * Execute reminder and mark as done
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<void>}
 */
const executeReminder = async (reminderId) => {
  await remindersRepository.markAsExecuted(reminderId);
  logger.info('Reminder executed', { reminderId });
};

/**
 * Format reminder info for Telegram message
 * @param {object} reminder - Reminder object
 * @returns {string}
 */
const formatReminderMessage = (reminder) => {
  const targetDate = new Date(reminder.targetTime);
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: process.env.TIMEZONE || 'UTC',
  }).format(targetDate);

  return `🔔 *Lembrete*\n\n📝 ${reminder.message}\n⏰ Agendado para: ${formatted}`;
};

/**
 * Get summary of user reminders
 * @param {number} userId - User ID
 * @returns {Promise<object>}
 */
const getRemindersSummary = async (userId) => {
  const reminders = await remindersRepository.getRemindersByUser(userId);
  const pending = reminders.filter(r => !r.executed);
  const executed = reminders.filter(r => r.executed);

  return {
    total: reminders.length,
    pending: pending.length,
    executed: executed.length,
    nextReminder: pending.length > 0 ? pending[0] : null,
  };
};

module.exports = {
  createReminder,
  listUserReminders,
  formatTimeUntil,
  deleteReminder,
  getPendingReminders,
  executeReminder,
  formatReminderMessage,
  getRemindersSummary,
};
