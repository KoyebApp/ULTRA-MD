import pkg from 'nayan-video-downloader';
import axios from 'axios';  // Import axios
import fs from 'fs';
import path from 'path';

const { twitterdown } = pkg;

const TIMEOUT = 30000;  // 30 seconds timeout for the fetch request
const MAX_RETRIES = 3;  // Max retries for failed downloads
const RETRY_DELAY = 2000;  // Delay between retries in milliseconds

// Retry logic for failed downloads
const fetchWithRetry = async (url, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      // Using axios to fetch the video with timeout
      const response = await axios.get(url, {
        responseType: 'stream', // Ensures we get the video as a stream
        timeout: TIMEOUT,       // Set the timeout
      });

      if (response.status === 200) {
        return response.data;  // Return the video stream
      } else {
        throw new Error(`Failed to fetch video, status: ${response.status}`);
      }
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

    // Fetch video with retry logic using axios
    const videoStream = await fetchWithRetry(hdUrl);

    const fileName = `${url.split('/').pop().split('?')[0]}.mp4`;  // Use last part of the URL for filename
    const mimetype = 'video/mp4';
    let caption = `≡ *Twitter DL*\n▢ *Video Filename:* ${fileName}\n▢ *Type:* ${mimetype}`.trim();

    // Send the video stream directly to the chat
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
