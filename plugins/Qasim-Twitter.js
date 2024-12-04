import pkg from 'nayan-video-downloader';
import fetch from 'node-fetch';
import { writeFile } from 'fs';  // To save the video file temporarily
import { join } from 'path';     // To handle file paths

const { twitterdown } = pkg;

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw `✳️ Enter the Twitter link next to the command`;
  if (!args[0].match(/twitter|x\.com/gi)) throw `❌ Link incorrect`;
  m.react('⏳');

  try {
    const url = args[0];
    let data = await twitterdown(url);
    console.log(data);  // Log the full response for debugging

    // Access HD video URL from the response
    const hdUrl = data.data.HD;

    if (!hdUrl) {
      throw '❌ HD video link not found. Please check the URL or try another one.';
    }

    // Fetch the video using node-fetch
    const response = await fetch(hdUrl);

    if (!response.ok) {
      throw `❌ Failed to fetch the video. Status: ${response.status}`;
    }

    // Generate a temporary file path for storing the video
    const fileName = `${url.split('/').pop().split('?')[0]}.mp4`; // Use last part of the URL for the filename
    const filePath = join(__dirname, fileName);  // Save the file locally in the same directory

    // Write the video to a local file
    const buffer = await response.buffer();
    await writeFile(filePath, buffer, (err) => {
      if (err) throw err;
    });

    // Send the video to the user
    const mimetype = 'video/mp4';
    let caption = `≡ *Twitter DL*\n▢ *Video Filename:* ${fileName}\n▢ *Type:* ${mimetype}`.trim();

    await conn.sendFile(m.chat, filePath, fileName, caption, m, false, { mimetype });

    // Clean up the temporary file (delete it after sending)
    fs.unlinkSync(filePath);

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
