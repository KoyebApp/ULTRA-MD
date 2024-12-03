import fs from 'fs';
import path from 'path';
import ytdl from 'youtubedl-core';
import { Client } from 'undici';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, args, isPrems, isOwner, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat];
  if (!args || !args[0]) throw `✳️ Example:\n${usedPrefix + command} https://youtu.be/YzkTFFwxtXI`;
  if (!args[0].match(/youtu/gi)) throw `❎ Verify that the YouTube link`;
  await m.react('⏳');

  // Convert Shorts URLs to regular YouTube URLs
  let videoURL = args[0];
  if (videoURL.includes("youtube.com/shorts/")) {
    // Extract the video ID and create a regular YouTube URL
    const videoID = videoURL.split('/shorts/')[1].split('?')[0];
    videoURL = `https://www.youtube.com/watch?v=${videoID}`;
  }

  const videoDetails = await ytddl(videoURL);
  if (!videoDetails) throw `❎ Error downloading video`;

  const { url, title, author, description } = videoDetails;

  // Log the URL to ensure it's correct
  console.log("Video URL:", url);

  // Validate if the URL is a valid stream URL
  if (!url || !url.startsWith('http')) {
    throw `❎ Invalid video URL or stream not available`;
  }

  // Use a readable stream for better handling of large files
  const videoStream = ytdl(url, { quality: 'highest', filter: 'audioandvideo' });

  // Check if the videoStream is valid
  if (!(videoStream instanceof Readable)) {
    throw `❎ Unable to fetch the video stream properly`;
  }

  const caption = `✼ ••๑⋯❀ Y O U T U B E ❀⋯⋅๑•• ✼
	  
❏ Title: ${title || 'Unknown'}
❒ Author: ${author || 'Unknown'}
❒ Description: ${description || 'No description available'}
❒ Link: ${args[0]}
⊱─━⊱༻●༺⊰━─⊰`;

  // Send the video as a stream
  conn.sendFile(m.chat, videoStream, `${title || 'video'}.mp4`, caption, m, false, { asDocument: chat.useDocument });
  await m.react('✅');
};

handler.help = ['ytmp4 <yt-link>'];
handler.tags = ['downloader'];
handler.command = ['ytmp4', 'video', 'ytv'];
handler.diamond = false;

export default handler;

async function ytddl(url) {
  try {
    // Fetch the video info
    const yt = await ytdl.getInfo(url);
    
    // Choose the highest quality video stream
    const link = ytdl.chooseFormat(yt.formats, { quality: 'highest', filter: 'audioandvideo' });

    // Log the chosen format URL
    console.log("Chosen Format URL:", link.url);

    return {
      url: link.url,  // Return the URL for the video stream
      title: yt.videoDetails.title,
      author: yt.videoDetails.author.name,
      description: yt.videoDetails.description,
    };
  } catch (error) {
    console.error("An error occurred:", error);
    return null;  // Ensure a null is returned on error
  }
}
