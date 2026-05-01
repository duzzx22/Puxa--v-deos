/**
 * Constants Module
 * Centralized constants for the application
 */

const COMMAND_PREFIXES = {
  VIDEO: '/video',
  AUDIO: '/audio',
  REMIND: '/remind',
  CLEAR: '/clear',
  DATE: '/date',
  START: '/start',
  HELP: '/help',
  STATUS: '/status',
};

const VIDEO_PLATFORMS = {
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  TWITTER: 'twitter',
  X: 'twitter', // Alias for Twitter/X
};

const PLATFORM_PATTERNS = {
  [VIDEO_PLATFORMS.TIKTOK]: [
    /tiktok\.com\/(@[\w.]+\/video|video)\/(\d+)/i,
    /vm\.tiktok\.com\/(\w+)/i,
  ],
  [VIDEO_PLATFORMS.INSTAGRAM]: [
    /instagram\.com\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/i,
    /instagr\.am\/(p|reel|tv)\/([a-zA-Z0-9_-]+)/i,
  ],
  [VIDEO_PLATFORMS.YOUTUBE]: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i,
  ],
  [VIDEO_PLATFORMS.TWITTER]: [
    /twitter\.com\/\w+\/status\/(\d+)/i,
    /x\.com\/\w+\/status\/(\d+)/i,
  ],
};

const TIME_UNITS = {
  SECONDS: 's',
  MINUTES: 'm',
  HOURS: 'h',
};

const ERROR_MESSAGES = {
  INVALID_URL: '❌ URL inválida ou não reconhecida',
  PLATFORM_NOT_SUPPORTED: '❌ Plataforma não suportada no momento',
  DOWNLOAD_FAILED: '❌ Falha ao baixar a mídia',
  FILE_TOO_LARGE: '❌ Arquivo muito grande para o Telegram',
  PARSING_ERROR: '❌ Erro ao processar a requisição',
  NO_PERMISSION: '❌ Você não tem permissão para usar este comando',
  USER_BLOCKED: '❌ Você foi bloqueado de usar este bot',
  RATE_LIMIT: '⏱️ Você está fazendo muitas solicitações. Aguarde alguns segundos',
  COMMAND_NOT_FOUND: '❌ Comando não encontrado',
  INTERNAL_ERROR: '❌ Erro interno do servidor',
};

const SUCCESS_MESSAGES = {
  DOWNLOAD_STARTED: '⏳ Processando seu vídeo...',
  DOWNLOAD_COMPLETED: '✅ Vídeo pronto!',
  AUDIO_EXTRACTED: '✅ Áudio extraído com sucesso!',
  REMINDER_SET: '✅ Lembrete configurado!',
  REMINDER_EXECUTED: '🔔 Seu lembrete chegou!',
  MESSAGES_CLEARED: '✅ Mensagens limpas com sucesso!',
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

const AUDIO_CONFIG = {
  FORMAT: 'mp3',
  BITRATE: '128k',
  SAMPLE_RATE: '44100',
  CHANNELS: 2,
};

const TELEGRAM_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_MESSAGE_LENGTH: 4096,
  MAX_MEDIA_GROUP_SIZE: 10,
};

const REMINDER_SEPARATOR = ':::';

const MESSAGE_TYPES = {
  TEXT: 'text',
  PHOTO: 'photo',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  ANIMATION: 'animation',
};

module.exports = {
  COMMAND_PREFIXES,
  VIDEO_PLATFORMS,
  PLATFORM_PATTERNS,
  TIME_UNITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  AUDIO_CONFIG,
  TELEGRAM_LIMITS,
  REMINDER_SEPARATOR,
  MESSAGE_TYPES,
};
