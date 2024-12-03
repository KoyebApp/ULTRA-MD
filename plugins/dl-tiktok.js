import fetch from 'node-fetch';
import pkg from 'nayan-media-downloader';
const { tikdown } = pkg;

const handler = async (message, { conn, args }) => {
  // Check if the URL is provided in the command arguments
  if (!args[0]) {
    throw '✳️ Please provide a TikTok link with the command';
  }

  // Validate the TikTok URL format
  const urlPattern = /tiktok\.com\/@[a-zA-Z0-9_]+\/video\/[0-9]+/gi;
  if (!args[0].match(urlPattern)) {
    throw '❌ Invalid TikTok link';
  }

  // React with a loading emoji to show the process has started
  message.react('⏳');

  try {
    // The TikTok video URL provided by the user
    const url = args[0];
    console.log('URL:', url);

    // Fetch video data using the nayan-media-downloader package
    let videoData = await tikdown(url);
    console.log('Video Data:', videoData);

    // Get the video URL from the response
    const videoUrl = videoData?.data?.videoUrl;

    // If no video URL is found, throw an error
    if (!videoUrl) {
      throw new Error('Could not fetch the video URL');
    }

    console.log('Download URL:', videoUrl);

    // Fetch the media content from the video URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch the video content');
    }

    // Convert the response to an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    // Send the video file to the user
    await conn.sendFile(message.chat, videoBuffer, 'tiktok.mp4', '*Powered by GlobalTechInfo*', message, false, { mimetype: 'video/mp4' });

    // React with a success emoji
    message.react('✅');
  } catch (error) {
    // Log and handle any errors
    console.error('Error downloading TikTok video:', error.message, error.stack);
    await message.reply('⚠️ An error occurred while processing the request. Please try again later.');
    message.react('❌');
  }
};

// Command aliases and tags pattern as requested
handler.help = ['tiktok', 'tikdown', 'tt'];
handler.tags = [download];
handler.command = ['tiktok', 'tikdown', 'tt'];

export default handler;
