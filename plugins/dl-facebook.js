import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw `You need to give the URL of Any Facebook video`;
  m.reply(wait);

  let res;
  try {
    res = await fetch(`https://global-tech-api.vercel.app/fbvideo?url=${text}`);
  } catch (error) {
    throw `An error occurred: ${error.message}`;
  }

  let api_response = await res.json();

  // Check if the response contains a result object and media URLs
  if (!api_response || !api_response.result) {
    throw `No video found or Invalid response from API.`;
  }

  const result = api_response.result;
  const { hd, sd, audio } = result; // These are the media URLs

  // Check if we have video or audio URLs
  if (hd || sd) {
    const mediaURL = hd || sd; // Prefer HD if available, otherwise fall back to SD
    const mediaType = 'video'; // We assume it's a video if we have one of these URLs

    let cap = `HERE IS THE ${mediaType.toUpperCase()} >,<`;

    // Send the video file
    conn.sendFile(m.chat, mediaURL, 'x.mp4', cap, m);
  } else if (audio) {
    const mediaURL = audio;
    const mediaType = 'audio'; // Audio file

    let cap = `HERE IS THE ${mediaType.toUpperCase()} >,<`;

    // Send the audio file
    conn.sendFile(m.chat, mediaURL, 'x.mp3', cap, m);
  } else {
    throw `No media found in the response.`;
  }
};

handler.help = ['Facebook'];
handler.tags = ['downloader'];
handler.command = /^(facebook|fb|fbdl)$/i;

export default handler;
