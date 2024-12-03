import fetch from 'node-fetch';
import pkg from 'nayan-media-downloader';
const { threads } = pkg;

let handler = async (message, { conn, args }) => {
  const errorMessages = {
    URL_NOT_PROVIDED: 'You must provide a valid URL.',
    URL_INVALID: 'Invalid URL. Please provide a correct URL.',
    FETCH_ERROR: 'Error fetching media. Please try again later.',
    DOWNLOAD_ERROR: 'Error downloading the media.',
    DOWNLOAD_SUCCESS: 'Media successfully downloaded!',
  };

  if (!args[0]) {
    throw new Error(errorMessages.URL_NOT_PROVIDED);
  }

  if (!args[0].match(/threads\.net\/(@[^\s\/]+\/post\/[^\s?]+)/gi)) {
    throw new Error(errorMessages.URL_INVALID);
  }

  message.reply('⏳');  // Indicating that the download process is starting
  try {
    const threadUrl = args[0];
    console.log('Fetching media from:', threadUrl);

    const mediaData = await fetch(threads, threadUrl); // Get media data
    console.log('Media data received:', mediaData);

    const { video, image } = mediaData;
    const mediaUrl = video || image; // If video exists, use video, otherwise use image

    if (!mediaUrl) {
      throw new Error(errorMessages.FETCH_ERROR);
    }

    console.log('Media URL:', mediaUrl);

    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) {
      throw new Error(errorMessages.DOWNLOAD_ERROR);
    }

    const buffer = await mediaResponse.buffer();
    const mimeType = video ? 'video/mp4' : 'image/jpeg';
    
    await conn.sendFile(message.chat, buffer, 'media', 'Download Media', message, false, {
      mimetype: mimeType,
    });

    message.reply('✅');  // Indicating that the media download was successful
  } catch (error) {
    console.error('Error:', error);
    await message.reply(errorMessages.FETCH_ERROR);
    message.reply('❌');  // Indicating that the media download failed
  }
};

handler.help = ['threads'];
handler.command = ['download'];
handler.tags = ['threads'];

export default handler;
