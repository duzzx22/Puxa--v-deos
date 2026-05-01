/**
 * Reminders Controller
 * Handles /remind command and reminder interactions
 */

const reminderService = require('../services/reminderService');
const logger = require('../utils/logger');
const { logUserAction } = require('../middlewares/auth');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * Handle /remind <time> <message> command
 * Example: /remind 10m Study math
 * @param {object} ctx - Telegraf context
 */
const handleReminderCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);

  logUserAction(ctx, 'REMINDER_COMMAND', { argsCount: args?.length });

  try {
    // Parse arguments
    if (!args || args.length < 2) {
      return ctx.reply(
        '📝 Uso: /remind <tempo> <mensagem>\n\n' +
        '⏱️ Formatos válidos:\n' +
        '• /remind 30s Teste\n' +
        '• /remind 10m Estudar\n' +
        '• /remind 2h Beber água'
      );
    }

    const timeStr = args[0];
    const message = args.slice(1).join(' ');

    // Create reminder
    const reminder = await reminderService.createReminder(userId, chatId, timeStr, message);

    // Format response
    const responseMsg =
      `${SUCCESS_MESSAGES.REMINDER_SET}\n\n` +
      `📝 *Mensagem:* ${message}\n` +
      `⏰ *Tempo:* ${timeStr}\n` +
      `🆔 *ID:* \`${reminder.id}\``;

    ctx.replyWithMarkdownV2(responseMsg, {
      reply_to_message_id: ctx.message.message_id,
    });

    logger.info('Reminder created successfully', {
      reminderId: reminder.id,
      userId,
      timeStr,
    });
  } catch (error) {
    logger.error('Reminder creation failed', error);
    ctx.reply(`❌ Erro ao criar lembrete: ${error.message}`);
  }
};

/**
 * Handle /reminders (list user reminders)
 * @param {object} ctx - Telegraf context
 */
const handleRemindersListCommand = async (ctx) => {
  const userId = ctx.from?.id;

  logUserAction(ctx, 'REMINDERS_LIST_COMMAND');

  try {
    const reminders = await reminderService.listUserReminders(userId);

    if (reminders.length === 0) {
      return ctx.reply('📭 Você não tem nenhum lembrete agendado');
    }

    let message = '⏰ *Seus Lembretes*\n\n';

    reminders.forEach((r, index) => {
      message +=
        `${index + 1}\\. 📝 ${escapeMarkdown(r.message)}\n` +
        `   ⏰ ${r.timeUntil}\n` +
        `   🆔 \`${r.id}\`\n\n`;
    });

    ctx.replyWithMarkdownV2(message);
  } catch (error) {
    logger.error('Failed to list reminders', error);
    ctx.reply('❌ Erro ao listar lembretes');
  }
};

/**
 * Handle /cancel <reminderId> (delete reminder)
 * @param {object} ctx - Telegraf context
 */
const handleCancelReminderCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);
  const reminderId = args?.[0];

  logUserAction(ctx, 'CANCEL_REMINDER_COMMAND', { reminderId });

  try {
    if (!reminderId) {
      return ctx.reply('🚫 Uso: /cancel <ID do lembrete>');
    }

    const deleted = await reminderService.deleteReminder(userId, reminderId);

    if (deleted) {
      ctx.reply('✅ Lembrete cancelado com sucesso');
    } else {
      ctx.reply('❌ Lembrete não encontrado');
    }
  } catch (error) {
    logger.error('Failed to cancel reminder', error);
    ctx.reply(`❌ Erro: ${error.message}`);
  }
};

/**
 * Execute and notify user about reminder
 * Called by jobs/reminderScheduler
 * @param {number} chatId - Chat ID
 * @param {object} reminder - Reminder object
 * @param {object} bot - Telegraf bot instance
 */
const notifyReminderExecution = async (chatId, reminder, bot) => {
  try {
    const message = reminderService.formatReminderMessage(reminder);
    await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    logger.info('Reminder notification sent', { reminderId: reminder.id, chatId });
  } catch (error) {
    logger.error('Failed to send reminder notification', error);
  }
};

/**
 * Escape markdown special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
const escapeMarkdown = (text) => {
  return text.replace(/([_*[\]()~`>#+\-.!])/g, '\\$1');
};

module.exports = {
  handleReminderCommand,
  handleRemindersListCommand,
  handleCancelReminderCommand,
  notifyReminderExecution,
};
