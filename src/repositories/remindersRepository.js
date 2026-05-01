/**
 * Reminders Repository
 * Handles persistence and retrieval of reminders (JSON storage)
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const remindersFile = config.jobs.remindersFile;

/**
 * Ensure reminders file exists
 */
const ensureFileExists = async () => {
  try {
    const dir = path.dirname(remindersFile);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    try {
      await fs.access(remindersFile);
    } catch {
      await fs.writeFile(remindersFile, JSON.stringify({ reminders: [] }, null, 2));
    }
  } catch (error) {
    logger.error('Failed to ensure reminders file', error);
  }
};

/**
 * Load all reminders from file
 * @returns {Promise<Array>}
 */
const loadReminders = async () => {
  try {
    await ensureFileExists();
    const content = await fs.readFile(remindersFile, 'utf-8');
    const data = JSON.parse(content);
    return data.reminders || [];
  } catch (error) {
    logger.error('Failed to load reminders', error);
    return [];
  }
};

/**
 * Save reminders to file
 * @param {Array} reminders - Reminders array
 * @returns {Promise<void>}
 */
const saveReminders = async (reminders) => {
  try {
    await ensureFileExists();
    await fs.writeFile(
      remindersFile,
      JSON.stringify(
        { reminders: reminders || [] },
        null,
        2
      )
    );
  } catch (error) {
    logger.error('Failed to save reminders', error);
    throw error;
  }
};

/**
 * Add new reminder
 * @param {object} reminder - Reminder object
 * @returns {Promise<object>}
 */
const addReminder = async (reminder) => {
  try {
    const reminders = await loadReminders();
    const newReminder = {
      id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      ...reminder,
    };

    reminders.push(newReminder);
    await saveReminders(reminders);

    logger.info('Reminder added', {
      reminderId: newReminder.id,
      userId: reminder.userId,
      targetTime: reminder.targetTime,
    });

    return newReminder;
  } catch (error) {
    logger.error('Failed to add reminder', error);
    throw error;
  }
};

/**
 * Get reminder by ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<object|null>}
 */
const getReminderById = async (reminderId) => {
  try {
    const reminders = await loadReminders();
    return reminders.find(r => r.id === reminderId) || null;
  } catch (error) {
    logger.error('Failed to get reminder', error);
    return null;
  }
};

/**
 * Get reminders by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>}
 */
const getRemindersByUser = async (userId) => {
  try {
    const reminders = await loadReminders();
    return reminders.filter(r => r.userId === userId);
  } catch (error) {
    logger.error('Failed to get reminders by user', error);
    return [];
  }
};

/**
 * Get pending reminders (those ready to execute)
 * @returns {Promise<Array>}
 */
const getPendingReminders = async () => {
  try {
    const reminders = await loadReminders();
    const now = Date.now();
    return reminders.filter(r => !r.executed && r.targetTime <= now);
  } catch (error) {
    logger.error('Failed to get pending reminders', error);
    return [];
  }
};

/**
 * Mark reminder as executed
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<void>}
 */
const markAsExecuted = async (reminderId) => {
  try {
    const reminders = await loadReminders();
    const reminder = reminders.find(r => r.id === reminderId);

    if (reminder) {
      reminder.executed = true;
      reminder.executedAt = Date.now();
      await saveReminders(reminders);

      logger.info('Reminder marked as executed', { reminderId });
    }
  } catch (error) {
    logger.error('Failed to mark reminder as executed', error);
    throw error;
  }
};

/**
 * Delete reminder by ID
 * @param {string} reminderId - Reminder ID
 * @returns {Promise<boolean>}
 */
const deleteReminder = async (reminderId) => {
  try {
    const reminders = await loadReminders();
    const filtered = reminders.filter(r => r.id !== reminderId);

    if (filtered.length !== reminders.length) {
      await saveReminders(filtered);
      logger.info('Reminder deleted', { reminderId });
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Failed to delete reminder', error);
    throw error;
  }
};

/**
 * Delete all reminders for a user
 * @param {number} userId - User ID
 * @returns {Promise<number>} - Number of deleted reminders
 */
const deleteUserReminders = async (userId) => {
  try {
    const reminders = await loadReminders();
    const beforeCount = reminders.length;
    const filtered = reminders.filter(r => r.userId !== userId);

    await saveReminders(filtered);
    logger.info('User reminders deleted', {
      userId,
      count: beforeCount - filtered.length,
    });

    return beforeCount - filtered.length;
  } catch (error) {
    logger.error('Failed to delete user reminders', error);
    throw error;
  }
};

module.exports = {
  loadReminders,
  saveReminders,
  addReminder,
  getReminderById,
  getRemindersByUser,
  getPendingReminders,
  markAsExecuted,
  deleteReminder,
  deleteUserReminders,
};
