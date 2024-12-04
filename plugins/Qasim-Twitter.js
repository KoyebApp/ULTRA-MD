import pkg from 'nayan-video-downloader';
import fetch from 'node-fetch';

const { twitterdown } = pkg;

const TIMEOUT = 30000;  // 30 seconds timeout for the fetch request
const MAX_RETRIES = 3;  // Max retries for failed downloads
const RETRY_DELAY = 2000;  // Delay between retries in milliseconds

// Helper function to handle fetch with timeout
const fetchWithTimeout = async (url, options) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Retry logic for failed downloads
const fetchWithRetry = async (url, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch video, status: ${response.status}`);
      return response;  // If successful, return the response
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw new Error('Max retries reached. Could not fetch video.');
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));  // Delay before retrying
    }
  }
};

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw `✳️ Enter the Twitter link next to the command`;
  if (!args[0].match(/twitter|x\.com/gi)) throw `❌ Link incorrect`;
  m.react('⏳');

  try {
    const url = args[0];
    let data = await twitterdown(url);
    const hdUrl = data.data.HD;

    if (!hdUrl) throw '❌ HD video link not found';

    // Fetch video with retry logic
    const response = await fetchWithRetry(hdUrl);

    const videoStream = response.body;
    const fileName = `${url.split('/').pop().split('?')[0]}.mp4`;  // Use last part of the URL for filename
    const mimetype = 'video/mp4';
    let caption = `≡ *Twitter DL*\n▢ *Video Filename:* ${fileName}\n▢ *Type:* ${mimetype}`.trim();

    // Send the video stream directly (no need to save to disk)
    await conn.sendFile(m.chat, videoStream, fileName, caption, m, false, { mimetype });

    m.react('✅');
  } catch (error) {
    console.error('Error downloading from Twitter:', error);
    await m.reply('⚠️ An error occurred while processing the request. Please try again later.');
    m.react('❌');
  }
};

handler.help = ['twitter <url>'];
handler.tags = ['downloader'];
handler.command = ['twitter', 'twitdl'];

export default handler;
  
