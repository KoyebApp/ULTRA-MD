import { tikdown } from 'nayan-video-downloader';

// Handler function for TikTok downloader
let handler = async (message, { conn, text, args, usedPrefix, command }) => {
  // Define user-friendly error messages
  const errorMessages = {
    missingUrl: 'Please provide a valid TikTok URL.',
    invalidUrl: 'The URL provided is not a valid TikTok URL.',
    fetchingError: 'Error fetching video. Please try again later.'
  };

  // If no argument is passed, try to extract the URL from the message text
  if (!args[0] && message.text) {
    args[0] = message.text.split(' ')[1]; // Extract the URL from the message if not in args
  }

  // If no URL is provided, return an error
  if (!args[0]) {
    throw errorMessages.missingUrl;
  }

  // Validate the TikTok URL using a regex
  const tiktokUrlPattern = /(?:https?:\/\/(?:www\.)?)?(?:tiktok\.com\/(?:[@a-zA-Z0-9_]+\/)?v\/(\d+)|(?:t\.co\/[a-zA-Z0-9]+))/i;
  if (!args[0].match(tiktokUrlPattern)) {
    throw errorMessages.invalidUrl;
  }

  // React with a loading emoji while fetching the video
  message.react('⏳');

  try {
    // Fetch the TikTok video using the TikTok URL
    const { data } = await tikdown(args[0]);
    const videoUrl = data.videoUrl; // The video URL from the response

    // Check if video URL exists
    if (!videoUrl) {
      throw new Error(errorMessages.fetchingError);
    }

    // Send the video to the user
    await conn.sendFile(message.chat, videoUrl, 'tiktok.mp4', 'Here is your TikTok video!', message);
    message.react('✅'); // Success emoji

  } catch (error) {
    console.error(error);
    await message.reply(errorMessages.fetchingError); // Send error message
    message.react('❌'); // Failure emoji
  }
};

// Command metadata
handler.help = ['tiktok', 'tikdown', 'tiktokdownloader'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tikdown', 'tiktokdownloader']; // Commands this handler responds to

export default handler;
