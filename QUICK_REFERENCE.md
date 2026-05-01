/**
 * QUICK REFERENCE GUIDE
 * Puxa Vídeos Bot - Command & Feature Reference
 */

/**
 * ============================================================================
 * INSTALLATION CHECKLIST
 * ============================================================================
 */

// 1. Prerequisites
// ✅ Node.js 18+ installed
// ✅ FFmpeg installed
// ✅ Telegram bot token obtained from @BotFather

// 2. Setup Commands
/*
  git clone <repo-url>
  cd puxa-videos-bot
  npm install
  cp .env.example .env
  # Edit .env with your settings
  npm run dev
*/

/**
 * ============================================================================
 * COMMAND USAGE
 * ============================================================================
 */

// Video Commands
/*
  /video https://tiktok.com/@user/video/123456
  /video https://instagram.com/reels/ABC123/
  /video https://youtube.com/watch?v=dQw4w9WgXcQ
  /video https://twitter.com/user/status/123456
*/

// Audio Commands
/*
  /audio https://youtube.com/watch?v=dQw4w9WgXcQ
  /audio https://tiktok.com/@user/video/123456
*/

// Reminder Commands
/*
  /remind 30s Quick test
  /remind 10m Task reminder
  /remind 2h Important meeting
  /reminders                           # List all
  /cancel reminder_1234567890_abc123   # Cancel by ID
*/

// Chat Commands (Admin only)
/*
  /clear 10    # Delete 10 messages
  /ban         # Ban user (reply to message)
  /unban 123456789
*/

// Utility Commands
/*
  /date        # Show current date/time
  /status      # Bot status & health
  /help        # Command list
  /start       # Welcome message
*/

/**
 * ============================================================================
 * ENVIRONMENT VARIABLES
 * ============================================================================
 */

process.env = {
  // Bot
  BOT_TOKEN: 'your_token_from_botfather',
  WEBHOOK_URL: 'https://yourdomain.com/webhook',
  WEBHOOK_PORT: 3000,

  // Admin
  ADMIN_IDS: '123456789,987654321',
  BLACKLIST_USERS: '111111111',

  // Rate Limiting
  RATE_LIMIT_ENABLED: true,
  RATE_LIMIT_WINDOW_MS: 10000,
  RATE_LIMIT_MAX_REQUESTS: 5,

  // Features
  ENABLE_TIKTOK: true,
  ENABLE_INSTAGRAM: true,
  ENABLE_YOUTUBE: true,
  ENABLE_TWITTER: true,

  // Settings
  TIMEZONE: 'America/Sao_Paulo',
  LOG_LEVEL: 'info',
  NODE_ENV: 'development',
};

/**
 * ============================================================================
 * API RESPONSE EXAMPLES
 * ============================================================================
 */

// Successful Video Download
const successResponse = {
  status: 200,
  message: 'Video downloaded successfully',
  data: {
    filePath: './temp/video_1234567890.mp4',
    platform: 'tiktok',
    size: 5242880, // 5MB
    duration: 15,
  },
};

// Successful Reminder Creation
const reminderResponse = {
  status: 200,
  id: 'reminder_1234567890_abc123',
  message: 'Reminder set successfully',
  data: {
    targetTime: 1674567890000,
    message: 'Study math',
    delayMs: 600000, // 10 minutes
  },
};

// Error Response
const errorResponse = {
  status: 400,
  error: 'Invalid URL',
  message: 'The provided URL is not valid or not supported',
  code: 'INVALID_URL',
};

/**
 * ============================================================================
 * LOGGING EXAMPLES
 * ============================================================================
 */

// All logs are in: logs/bot.log and logs/error.log

/*
[2024-01-15 10:30:45] [INFO]: User action: VIDEO_COMMAND
[2024-01-15 10:30:46] [DEBUG]: Download starting for https://tiktok.com/...
[2024-01-15 10:30:50] [INFO]: Download completed successfully
[2024-01-15 10:31:00] [WARN]: Rate limit exceeded for user 123456
[2024-01-15 10:31:05] [ERROR]: Failed to download: ENOTFOUND api.service.com
*/

/**
 * ============================================================================
 * PERFORMANCE BENCHMARKS
 * ============================================================================
 */

const benchmarks = {
  videoDownload: {
    small: '~3-5 seconds', // < 10MB
    medium: '~10-20 seconds', // 10-50MB
    timeout: '30 seconds default', // configurable
  },
  audioExtraction: {
    short: '~5-10 seconds', // < 1 minute
    long: '~20-40 seconds', // > 5 minutes
    totalTime: 'video_download + extraction',
  },
  reminderCreation: '< 100ms',
  reminderExecution: '0-1 second after scheduled time',
  memoryUsage: '~150-250MB base',
  cpuUsage: 'Low (async I/O)',
};

/**
 * ============================================================================
 * TROUBLESHOOTING
 * ============================================================================
 */

const troubleshooting = {
  'BOT_TOKEN not configured': {
    cause: 'Environment variable not set',
    solution: 'Create .env file with BOT_TOKEN=xxx',
  },

  'FFmpeg not available': {
    cause: 'FFmpeg not installed on system',
    solution: 'Install: apt-get install ffmpeg',
  },

  'Download failed': {
    causes: [
      'Invalid URL or unsupported platform',
      'Timeout (increase DOWNLOAD_TIMEOUT_MS)',
      'File too large (increase MAX_FILE_SIZE_MB)',
      'No internet connection',
    ],
    solution: 'Check logs in logs/bot.log',
  },

  'Rate limit exceeded': {
    cause: 'Too many commands too quickly',
    solution: 'Wait a few seconds or adjust RATE_LIMIT_MAX_REQUESTS',
  },

  'Bot not responding': {
    causes: [
      'Process crashed',
      'Bot token expired',
      'Telegram API down',
    ],
    solution: 'Check logs and restart with npm run dev',
  },
};

/**
 * ============================================================================
 * PROJECT METRICS
 * ============================================================================
 */

const metrics = {
  codeSize: {
    totalLines: '~1200',
    sourceFiles: 14,
    configFiles: 5,
    documentationFiles: 3,
  },
  architecture: {
    controllers: 5,
    services: 3,
    repositories: 1,
    middlewares: 2,
    job_schedulers: 1,
  },
  features: {
    commands: 15,
    platforms: 4, // TikTok, Instagram, YouTube, Twitter
    integrations: 'Pluggable architecture',
  },
  quality: {
    errorHandling: 'Comprehensive',
    logging: 'Structured (Winston)',
    security: 'Admin whitelist, Blacklist, Rate limit',
    reliability: 'Retry with backoff',
  },
};

/**
 * ============================================================================
 * PRODUCTION DEPLOYMENT
 * ============================================================================
 */

// Method 1: VPS
const vpsSteps = [
  '1. SSH into server',
  '2. Install Node.js 18+',
  '3. Install FFmpeg',
  '4. Clone repository',
  '5. npm install --production',
  '6. Configure .env',
  '7. Use PM2: pm2 start src/index.js --name bot',
  '8. Set up reverse proxy (Nginx)',
  '9. Configure SSL/TLS',
  '10. Enable auto-restart: pm2 startup',
];

// Method 2: Docker
const dockerSteps = [
  'docker build -t puxa-bot .',
  'docker run -e BOT_TOKEN=xxx puxa-bot',
  'OR use docker-compose up -d',
];

// Method 3: Webhook with Express
const webhookSetup = {
  requirement: 'HTTPS domain (https://yourdomain.com)',
  configuration: {
    WEBHOOK_URL: 'https://yourdomain.com/webhook',
    NODE_ENV: 'production',
  },
  endpoint: 'POST /webhook - handles all Telegram updates',
};

/**
 * ============================================================================
 * SECURITY BEST PRACTICES
 * ============================================================================
 */

const security = [
  '✅ Use environment variables for secrets',
  '✅ Never commit .env file',
  '✅ Enable admin whitelist for sensitive commands',
  '✅ Use HTTPS for webhook',
  '✅ Implement rate limiting',
  '✅ Validate all user input',
  '✅ Sanitize file downloads',
  '✅ Monitor logs for suspicious activity',
  '✅ Keep dependencies updated',
  '✅ Use strong bot token',
];

/**
 * ============================================================================
 * USEFUL LINKS
 * ============================================================================
 */

const links = {
  documentation: {
    main: 'README.md',
    development: 'DEVELOPMENT.md',
    integrations: 'src/integrations/README.md',
  },
  external: {
    botFather: 'https://t.me/botfather',
    telegraf: 'https://telegraf.js.org/',
    telegram: 'https://telegram.org/',
    ffmpeg: 'https://ffmpeg.org/',
  },
  support: {
    issues: 'GitHub Issues',
    discussions: 'GitHub Discussions',
    email: 'seu-email@example.com',
  },
};

/**
 * ============================================================================
 * VERSION & COMPATIBILITY
 * ============================================================================
 */

const version = {
  project: '1.0.0',
  node: '18+',
  npm: '9+',
  telegraf: '^4.14.1',
  ffmpeg: 'Latest stable',
};

module.exports = {
  benchmarks,
  troubleshooting,
  metrics,
  vpsSteps,
  dockerSteps,
  webhookSetup,
  security,
  links,
  version,
};
