/**
 * Utility Commands Controller
 * Handles /date, /help, /status commands
 */

const logger = require('../utils/logger');
const { getDateTimeFormatted } = require('../utils/helpers');
const { logUserAction } = require('../middlewares/auth');
const config = require('../config');

/**
 * Handle /date command
 * Show current date and time
 * @param {object} ctx - Telegraf context
 */
const handleDateCommand = async (ctx) => {
  logUserAction(ctx, 'DATE_COMMAND');

  try {
    const dateInfo = getDateTimeFormatted(config.timezone);

    const message =
      `📅 *Data* \\(${config.timezone}\\)\n\n` +
      `📆 ${dateInfo.date}\n` +
      `🕐 ${dateInfo.time}`;

    ctx.replyWithMarkdownV2(message);

    logger.info('Date command executed');
  } catch (error) {
    logger.error('Date command failed', error);
    ctx.reply('❌ Erro ao obter data/hora');
  }
};

/**
 * Handle /start command
 * Show welcome message
 * @param {object} ctx - Telegraf context
 */
const handleStartCommand = async (ctx) => {
  const username = ctx.from?.username || 'Usuário';

  logUserAction(ctx, 'START_COMMAND');

  const message =
    `👋 *Bem-vindo, ${escapeMarkdown(username)}!*\n\n` +
    'Eu sou um bot multifuncional com recursos incríveis. Digite /help para ver a lista de comandos.\n\n' +
    '🎬 Baixe vídeos\n' +
    '🎵 Extraia áudio\n' +
    '⏰ Configure lembretes\n' +
    '🧹 Limpe bate-papos\n' +
    '📅 Verifique datas';

  ctx.replyWithMarkdownV2(message);
};

/**
 * Handle /help command
 * Show available commands
 * @param {object} ctx - Telegraf context
 */
const handleHelpCommand = async (ctx) => {
  logUserAction(ctx, 'HELP_COMMAND');

  const message = '*📋 Lista de Comandos*\n\n*🎬 Mídia*\n/video <url> - Baixar vídeo\n/audio <url> - Extrair áudio de vídeo\n\n*⏰ Lembretes*\n/remind <tempo> <msg> - Criar lembrete\n/reminders - Listar lembretes\n/cancel <id> - Cancelar lembrete\n\n*📅 Utilidades*\n/date - Ver data/hora\n/status - Status do bot\n\n*ℹ️ Outros*\n/help - Esta mensagem\n/start - Mensagem de boas-vindas\n\n*💡 Exemplos:*\n`/remind 10m Estudar`\n`/video https://tiktok.com/...`\n`/audio https://youtube.com/...';
  ctx.replyWithMarkdownV2(message);
};

const handleStatusCommand = async (ctx) => {
  logUserAction(ctx, 'STATUS_COMMAND');

  try {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    const dateInfo = getDateTimeFormatted(config.timezone);

    const message =
      '*🤖 Status do Bot*\n\n' +
      '✅ Status: Ativo\n' +
      '⏱️ Uptime: ' + uptimeHours + 'h ' + uptimeMinutes + 'm ' + uptimeSeconds + 's\n' +
      '💾 Memória: ' + heapUsedMB + 'MB / ' + heapTotalMB + 'MB\n' +
      '📍 Versão: 1.0.0\n' +
      '🌍 Timezone: ' + config.timezone + '\n' +
      '🕐 Horário: ' + dateInfo.formatted + '\n\n' +
      '📊 *Recursos Ativados:*\n' +
      '🎬 TikTok: ' + (config.integrations.tiktok ? '✅' : '❌') + '\n' +
      '📸 Instagram: ' + (config.integrations.instagram ? '✅' : '❌') + '\n' +
      '▶️ YouTube: ' + (config.integrations.youtube ? '✅' : '❌') + '\n' +
      '𝕏 Twitter: ' + (config.integrations.twitter ? '✅' : '❌');

    ctx.replyWithMarkdownV2(message);

    logger.info('Status command executed');
  } catch (error) {
    logger.error('Status command failed', error);
    ctx.reply('❌ Erro ao obter status');
  }
};

/**
 * Escape markdown special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
const escapeMarkdown = (text) => {
  if (!text) return '';
  return text.replace(/([_*[\]()~`>#+\-.!])/g, '\\$1');
};

module.exports = {
  handleDateCommand,
  handleStartCommand,
  handleHelpCommand,
  handleStatusCommand
};
