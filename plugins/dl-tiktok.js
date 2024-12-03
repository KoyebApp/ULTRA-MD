import { tikdown } from 'nayan-media-downloader';

// Handler function for downloading TikTok video
let handler = async (message, { conn, text, args, usedPrefix, command }) => {
  // Define user-friendly error messages
  const errorMessages = {
    missingUrl: 'Please provide a valid TikTok URL.',
    invalidUrl: 'The URL provided is not a valid TikTok URL.',
    fetchingError: 'Error fetching video. Please try again later.'
  };

  // Check if URL is provided
  if (!args[0] && message.text) {
    args[0] = message.text; // If no URL provided, take it from the message text
  }

  // Validate the URL (it should contain "tiktok")
  if (!args[0] || !args[0].match(/tiktok/gi)) {
    throw errorMessages.invalidUrl;
  }

  // Show a loading emoji while fetching
  message.react('⏳');

  try {
    // Fetch the TikTok video data using the URL
    const { data } = await tikdown(args[0]);
    const videoUrl = data.videoUrl;

    // Check if the video URL exists
    if (!videoUrl) {
      throw new Error(errorMessages.fetchingError);
    }

    // Send the video file to the user
    await conn.sendFile(message.chat, videoUrl, 'tiktok.mp4', 'Here is your TikTok video!', message);
    message.react('✅'); // Success

  } catch (error) {
    console.error(error);
    await message.reply(errorMessages.fetchingError); // Send error message to the user
    message.react('❌'); // Failure
  }
};

// Command metadata and regex
handler.help = ['tiktok', 'tikdown', 'tiktokdownloader'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tikdown', 'tiktokdownloader'];

export default handler;
