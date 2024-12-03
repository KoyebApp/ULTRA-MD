import fetch from 'node-fetch';
import pkg from 'nayan-video-downloader';
const { pintarest } = pkg; // Correct import for the package

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      console.log(`Retrying... (${i + 1})`);
    } catch (error) {
      console.error("Error fetching URL:", error.message);
      if (i === retries - 1) throw new Error("Failed to fetch media content after retries");
    }
  }
};

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw '✳️ Enter the Pinterest link next to the command';
  if (!args[0].match(/(pinterest\.com\/pin\/|pin\.it\/)/gi)) throw '❌ Link incorrect';

  m.react('⏳');
  try {
    const url = args[0];
    console.log('Checking link:', url);

    // Fetching data from Pinterest using 'pinterest' method from the package
    let mediaData;
    try {
      mediaData = await pintarest(url); // You must ensure this method exists and works
      console.log('Media Data:', mediaData);
    } catch (error) {
      console.error('Error fetching Pinterest data:', error.message);
      throw new Error('Could not fetch Pinterest data');
    }

    // Ensure mediaData and the necessary properties exist before accessing them
    if (!mediaData || !mediaData.url) {
      throw new Error('Could not fetch the media download URL');
    }

    const downloadUrl = mediaData.url; // Get URL directly from mediaData

    console.log('Download URL:', downloadUrl);

    // Check if the type is video or image
    if (mediaData.type === 'video') {
      // Handle video
      const response = await fetchWithRetry(downloadUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('video')) {
        throw new Error('Invalid content type received for video');
      }

      const arrayBuffer = await response.arrayBuffer();
      const mediaBuffer = Buffer.from(arrayBuffer);

      if (mediaBuffer.length === 0) throw new Error('Downloaded video is empty');

      const fileName = mediaData.title ? `${mediaData.title}.mp4` : 'media.mp4';
      const mimetype = 'video/mp4';

      await conn.sendFile(m.chat, mediaBuffer, fileName, 'Here is your downloaded video', m, false, { mimetype });
      m.react('✅');
    } else if (mediaData.type === 'image') {
      // Handle image
      const imageUrl = mediaData.thumbnail || mediaData.url;
      try {
        const response = await fetchWithRetry(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            'Accept': 'application/json, text/plain, */*'
          }
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('image')) {
          throw new Error('Invalid content type received for image');
        }

        const arrayBuffer = await response.arrayBuffer();
        const mediaBuffer = Buffer.from(arrayBuffer);

        if (mediaBuffer.length === 0) throw new Error('Downloaded image is empty');

        const fileName = mediaData.title ? `${mediaData.title}.jpg` : 'media.jpg';
        const mimetype = 'image/jpeg';

        await conn.sendFile(m.chat, mediaBuffer, fileName, 'Here is your downloaded image', m, false, { mimetype });
        m.react('✅');
      } catch (error) {
        console.error("Error fetching or processing image:", error.message);
        throw new Error('Failed to fetch or process image');
      }
    } else {
      throw new Error('Unknown media type');
    }
  } catch (error) {
    console.error('Error processing Pinterest download:', error.message);
    await m.reply('⚠️ An error occurred while processing the request. Please try again later.');
    m.react('❌');
  }
};

// Global handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

handler.help = ['pinterest', 'pin'];
handler.tags = ['downloader'];
handler.command = ['pinterest', 'pin'];

export default handler;
