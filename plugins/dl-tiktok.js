import fetch from 'node-fetch';
import pkg from 'nayan-video-downloader';
const { tikdown } = pkg;

const handler = async (message, { conn, args }) => {
  // Check if the URL is provided in the command arguments
  if (!args[0]) {
    throw '✳️ Enter the TikTok link next to the command';
  }

  // Validate the URL format for TikTok, including shortened URLs like vm.tiktok.com
  const urlPattern = /(?:https?:\/\/(?:www\.)?)?(tiktok\.com\/(?:[^\/]+\/v\/\d+|[^\/]+\/post\/\d+)|vm\.tiktok\.com\/[\w\d]+)/gi;
  if (!args[0].match(urlPattern)) {
    throw '❌ Invalid TikTok link';
  }

  // React with a loading emoji to show the process has started
  message.react('⏳');

  try {
    // The URL of the TikTok video
    const url = args[0];
    console.log('URL:', url);

    // Fetch media data using the nayan-video-downloader package
    let mediaData = await tikdown(url);
    console.log('Media Data:', mediaData);

    // Destructure the video URL from the fetched media data
    const { videoUrl } = mediaData.data;

    // If no video URL is found, throw an error
    if (!videoUrl) {
      throw new Error('Could not fetch the video URL');
    }

    console.log('Download URL:', videoUrl);

    // Fetch the media content from the download URL
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch the media content');
    }

    // Convert the response to an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);

    // Send the video file to the user
    await conn.sendFile(message.chat, mediaBuffer, 'tiktok.mp4', 'Here is your TikTok video', message, false, { mimetype: 'video/mp4' });

    // React with a success emoji
    message.react('✅');
  } catch (error) {
    // Log and handle any errors
    console.error('Error downloading from TikTok:', error.message, error.stack);
    await message.reply('⚠️ An error occurred while processing the request. Please try again later.');
    message.react('❌');
  }
};

// Define command metadata
handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
handler.command = ['tiktok'];

export default handler;
