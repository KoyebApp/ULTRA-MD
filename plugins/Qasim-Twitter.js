import pkg from 'nayan-video-downloader';
const { twitterdown } = pkg;

const handler = async (m, { conn, args }) => {
  if (!args[0]) throw `✳️ Enter the Twitter link next to the command`;
  if (!args[0].match(/twitter|x\.com/gi)) throw `❌ Link incorrect`;
  m.react('⏳');

  try {
    const url = args[0];
    let data = await twitterdown(url);

    console.log(data);  // Log the full response to check

    // Access HD video URL from the response
    const hdUrl = data.data.HD;

    if (!hdUrl) {
      throw '❌ HD video link not found. Please check the URL or try another one.';
    }

    const fileName = `${url.split('/').pop().split('?')[0]}.mp4`; // Use the last part of the URL for filename
    const mimetype = 'video/mp4';  // We are dealing with video in mp4 format

    let caption = `≡ *Twitter DL*\n▢ *Video Filename:* ${fileName}\n▢ *Type:* ${mimetype}`.trim();

    // Send the HD video directly
    await conn.sendFile(m.chat, hdUrl, fileName, caption, m, false, { mimetype });
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
