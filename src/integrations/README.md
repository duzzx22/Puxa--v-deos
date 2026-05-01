/**
 * External Integrations Example
 * This file shows how to implement real API integrations
 * for video download services
 */

/**
 * TIKTOK INTEGRATION EXAMPLE
 * Using a public API service (e.g., TikTok API, Snaptik, TikMate)
 */
const downloadTikTokExample = async (url) => {
  // Example using a hypothetical API
  const axios = require('axios');

  const response = await axios.get('https://api.tikapi.io/video', {
    params: {
      url: url,
      token: process.env.TIKAPI_TOKEN,
    },
  });

  // Expected response:
  // {
  //   video: "https://media.url.mp4",
  //   thumbnail: "https://...",
  //   duration: 15,
  //   author: "username"
  // }

  return response.data;
};

/**
 * INSTAGRAM INTEGRATION EXAMPLE
 * Using instagrapi or similar library
 */
const downloadInstagramExample = async (url) => {
  // Option 1: Using instagrapi library
  // npm install instagrapi

  // const { Client } = require('instagrapi');
  // const client = new Client();
  // await client.login(process.env.INSTAGRAM_USER, process.env.INSTAGRAM_PASS);
  // const media = await client.media_info_by_pk(media_pk);
  // return media.video_url || media.image_url;

  // Option 2: Using a proxy API
  const axios = require('axios');

  const response = await axios.get('https://api.instagram.com/oembed', {
    params: { url },
  });

  return response.data;
};

/**
 * YOUTUBE INTEGRATION EXAMPLE
 * Using yt-dlp or youtube-dl
 */
const downloadYouTubeExample = async (url) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const fs = require('fs').promises;
  const path = require('path');

  const execAsync = promisify(exec);

  // Using yt-dlp (recommended)
  // Install: pip install yt-dlp
  
  const outputDir = path.join(process.env.TEMP_DIR, 'youtube');
  const outputPattern = path.join(outputDir, '%(title)s.%(ext)s');

  await fs.mkdir(outputDir, { recursive: true });

  const command = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputPattern}" "${url}"`;

  const { stdout, stderr } = await execAsync(command, {
    timeout: process.env.DOWNLOAD_TIMEOUT_MS,
  });

  // Get the downloaded file path
  const files = await fs.readdir(outputDir);
  const videoFile = files.find(f => f.endsWith('.mp4'));

  return {
    filePath: path.join(outputDir, videoFile),
    platform: 'youtube',
  };
};

/**
 * TWITTER/X INTEGRATION EXAMPLE
 * Using Twitter API v2 or media endpoint
 */
const downloadTwitterExample = async (url) => {
  const axios = require('axios');
  const twurl = require('twurl'); // or twitter-api-v2

  // Extract tweet ID from URL
  const tweetIdMatch = url.match(/\/status\/(\d+)/);
  const tweetId = tweetIdMatch?.[1];

  if (!tweetId) throw new Error('Invalid Twitter URL');

  // Using Twitter API v2
  const response = await axios.get(
    `https://api.twitter.com/2/tweets/${tweetId}`,
    {
      params: {
        'tweet.fields': 'attachments',
        'media.fields': 'preview_image_url,url,variants',
        expansions: 'attachments.media_keys',
      },
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    }
  );

  // Find video variant
  const videos = response.data.includes?.media?.filter(m => m.type === 'video');
  const videoUrl = videos?.[0]?.variants?.find(v => v.content_type === 'video/mp4')?.url;

  return {
    url: videoUrl,
    platform: 'twitter',
  };
};

/**
 * GENERIC HTTP DOWNLOAD FOR DIRECT URLS
 */
const downloadDirectUrl = async (url) => {
  const axios = require('axios');
  const fs = require('fs').promises;
  const path = require('path');

  const filename = `video_${Date.now()}.mp4`;
  const filePath = path.join(process.env.TEMP_DIR, filename);

  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: process.env.DOWNLOAD_TIMEOUT_MS,
  });

  const writer = require('fs').createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve({ filePath }));
    writer.on('error', reject);
  });
};

module.exports = {
  downloadTikTokExample,
  downloadInstagramExample,
  downloadYouTubeExample,
  downloadTwitterExample,
  downloadDirectUrl,
};

/**
 * IMPLEMENTATION NOTES
 *
 * 1. TIKTOK:
 *    - Public APIs: TikTok API, Snaptik, TikMate
 *    - Considerations: Rate limits, watermark removal
 *    - Alternative: Use puppeteer for scraping
 *
 * 2. INSTAGRAM:
 *    - Best: Use instagram-graph-api or instagrapi
 *    - Caution: Account may be flagged if using scraper
 *    - Alternative: Use official Business API
 *
 * 3. YOUTUBE:
 *    - Recommended: yt-dlp (maintained fork of youtube-dl)
 *    - Install: pip install yt-dlp or npm install youtube-dl-exec
 *    - Respects robots.txt and copyright
 *
 * 4. TWITTER:
 *    - Use: Official Twitter API v2 with Bearer Token
 *    - Apply: twitter.com/apps for elevated access
 *    - Rate limits: 450 requests / 15 minutes for user context
 *
 * 5. ERROR HANDLING:
 *    - Always implement retry logic
 *    - Use exponential backoff
 *    - Log detailed error messages
 *    - Gracefully handle rate limits
 *    - Clean up temp files on failure
 *
 * 6. SECURITY:
 *    - Never expose API keys in logs
 *    - Validate all URLs before processing
 *    - Limit file sizes
 *    - Run FFmpeg in sandboxed environment
 *    - Use Content Security Policy headers
 */
