/**
 * Chat Management Controller
 * Handles /clear and other chat moderation commands
 */

const logger = require('../utils/logger');
const { requireAdmin, logUserAction } = require('../middlewares/auth');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * Handle /clear <count> command
 * Deletes last N messages (admin only)
 * @param {object} ctx - Telegraf context
 */
const handleClearCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);
  const count = parseInt(args?.[0], 10);

  logUserAction(ctx, 'CLEAR_COMMAND', { count, requestedBy: userId });

  // Check admin permissions via middleware
  if (!ctx.state?.isAdmin) {
    return ctx.reply(ERROR_MESSAGES.NO_PERMISSION);
  }

  try {
    // Validation
    if (!count || isNaN(count) || count < 1 || count > 100) {
      return ctx.reply(
        '🧹 Uso: /clear <número>\n\n' +
        '📋 Exemplos:\n' +
        '• /clear 10 - deletar últimas 10 mensagens\n' +
        '• /clear 50 - deletar últimas 50 mensagens\n\n' +
        '⚠️ Máximo: 100 mensagens'
      );
    }

    // Check if command was executed in group/supergroup
    if (ctx.chat?.type !== 'group' && ctx.chat?.type !== 'supergroup') {
      return ctx.reply('❌ Este comando só funciona em grupos');
    }

    // Verify bot has permission to delete messages
    try {
      const botMember = await ctx.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id);
      if (!botMember.can_delete_messages) {
        return ctx.reply('❌ O bot não tem permissão para deletar mensagens neste grupo');
      }
    } catch (error) {
      logger.error('Failed to check bot permissions', error);
      return ctx.reply('❌ Erro ao verificar permissões');
    }

    // Process deletion
    let deleted = 0;
    let failed = 0;

    const startMessageId = ctx.message.message_id;

    // Try to delete messages from newest to oldest
    for (let i = 1; i <= count; i++) {
      try {
        const messageId = startMessageId - i;
        await ctx.telegram.deleteMessage(ctx.chat.id, messageId);
        deleted++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        // Message might not exist or already deleted
        if (!error.message?.includes('message to delete not found')) {
          failed++;
          logger.debug('Failed to delete message', { error: error.message });
        }
      }
    }

    // Send summary
    const summaryMsg =
      `${SUCCESS_MESSAGES.MESSAGES_CLEARED}\n\n` +
      `✅ Deletadas: ${deleted} mensagens\n` +
      `❌ Falhas: ${failed}`;

    ctx.reply(summaryMsg);

    logger.info('Chat cleared', {
      chatId: ctx.chat.id,
      admin: userId,
      deleted,
      failed,
    });
  } catch (error) {
    logger.error('Clear command failed', error);
    ctx.reply('❌ Erro ao limpar mensagens');
  }
};

/**
 * Handle /ban command (admin only)
 * Bans user from group
 * @param {object} ctx - Telegraf context
 */
const handleBanCommand = async (ctx) => {
  const userId = ctx.from?.id;

  logUserAction(ctx, 'BAN_COMMAND', { requestedBy: userId });

  if (!ctx.state?.isAdmin) {
    return ctx.reply(ERROR_MESSAGES.NO_PERMISSION);
  }

  try {
    // Check if command has reply
    if (!ctx.message?.reply_to_message?.from?.id) {
      return ctx.reply('⚠️ Responda a um usuário para banir');
    }

    const targetUserId = ctx.message.reply_to_message.from.id;
    const targetUsername = ctx.message.reply_to_message.from.username || 'desconhecido';

    if (targetUserId === ctx.botInfo.id) {
      return ctx.reply('❌ Não posso me banir');
    }

    // Ban user
    await ctx.telegram.kickChatMember(ctx.chat.id, targetUserId);

    ctx.reply(`✅ Usuário @${targetUsername} foi banido do grupo`);

    logger.info('User banned', {
      chatId: ctx.chat.id,
      bannedUser: targetUserId,
      bannedBy: userId,
    });
  } catch (error) {
    logger.error('Ban command failed', error);
    ctx.reply('❌ Erro ao banir usuário');
  }
};

/**
 * Handle /unban command (admin only)
 * @param {object} ctx - Telegraf context
 */
const handleUnbanCommand = async (ctx) => {
  const userId = ctx.from?.id;
  const args = ctx.message?.text?.split(/\s+/).slice(1);
  const targetUserId = parseInt(args?.[0], 10);

  logUserAction(ctx, 'UNBAN_COMMAND', { targetUserId, requestedBy: userId });

  if (!ctx.state?.isAdmin) {
    return ctx.reply(ERROR_MESSAGES.NO_PERMISSION);
  }

  try {
    if (!targetUserId || isNaN(targetUserId)) {
      return ctx.reply('🚫 Uso: /unban <user_id>');
    }

    await ctx.telegram.unbanChatMember(ctx.chat.id, targetUserId);
    ctx.reply(`✅ Usuário desbanido`);

    logger.info('User unbanned', {
      chatId: ctx.chat.id,
      unbannedUser: targetUserId,
      unbannedBy: userId,
    });
  } catch (error) {
    logger.error('Unban command failed', error);
    ctx.reply('❌ Erro ao desbanir usuário');
  }
};

module.exports = {
  handleClearCommand,
  handleBanCommand,
  handleUnbanCommand,
};
