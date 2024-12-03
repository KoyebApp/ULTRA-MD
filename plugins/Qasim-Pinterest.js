import fetch from 'node-fetch';
import pkg from 'nayan-video-downloader';
const { pintarest } = pkg;

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw `✳️ Enter the Pinterest link next to the command`;
  if (!args[0].match(/(pinterest\.com\/pin\/|pin\.it\/)/gi)) throw `❌ Link incorrect`;
  m.react('⏳');

  try {
    const url = args[0];
    console.log('URL:', url); // Debug log for URL

    // Fetch media data using nayan-media-downloader
    let mediaData = await pintarest(url);
    console.log('Media Data:', mediaData); // Debug log for media data

    // Check if it's a video or image based on type
    const downloadUrl = mediaData.type === 'video' ? mediaData.url : mediaData.thumbnail;
    if (!downloadUrl) throw new Error('Could not fetch the download URL');

    console.log('Download URL:', downloadUrl); // Debug log for download URL

    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Failed to fetch the media content');

    const arrayBuffer = await response.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);

    // Determine file type and set filename and mimetype
    const fileName = mediaData.type === 'video' ? 'media.mp4' : 'media.jpg';
    const mimetype = mediaData.type === 'video' ? 'video/mp4' : 'image/jpeg';

    await conn.sendFile(m.chat, mediaBuffer, fileName, `Here is your media`, m, false, { mimetype });
    m.react('✅');
  } catch (error) {
    console.error('Error downloading from Pinterest:', error.message, error.stack);
    await m.reply('⚠️ An error occurred while processing the request. Please try again later.');
    m.react('❌');
  }
};

handler.help = ['pinterest <url>'];
handler.tags = ['downloader'];
handler.command = ['pinterest'];

export default handler;
