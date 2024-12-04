import pkg from 'nayan-video-downloader';
import axios from 'axios';

const { twitterdown } = pkg;

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw `✳️ Enter the Twitter link next to the command`;
  if (!args[0].match(/twitter|x\.com/gi)) throw `❌ Link incorrect`;
  m.react('⏳');

  try {
    const url = args[0];
    let data = await twitterdown(url);
    const hdUrl = data.data.HD;

    if (!hdUrl) throw '❌ HD video link not found';

    // Attempting download with retry logic using Axios
    const response = await axios.get(hdUrl, {
      responseType: 'stream',  // Ensures we get a stream for video
      timeout: 10000,  // 60-second timeout
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch video, status: ${response.status}`);
    }

    // Send the video stream directly to the chat
    const videoStream = response.data;
    const fileName = `${url.split('/').pop().split('?')[0]}.mp4`;  // Use last part of the URL for filename
    const mimetype = 'video/mp4';
    let caption = `≡ *Twitter DL*\n▢ *Video Filename:* ${fileName}\n▢ *Type:* ${mimetype}`.trim();

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
