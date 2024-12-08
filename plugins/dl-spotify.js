import fetch from 'node-fetch';
import displayLoadingScreen from '../lib/loading.js';

let handler = async (m, { conn, text }) => {
  if (!text) {
    console.log('No song name provided.');
    throw '*Please enter a song name*';
  }

  m.react('🎶');

  const query = encodeURIComponent(text);
  const searchUrl = `https://global-tech-api.vercel.app/spotifysearch?query=${query}`;

  try {
    let spurl = await fetch(searchUrl);
    spurl = await spurl.json();
    console.log('Spotify Search API Response:', spurl);

    if (!spurl.data || spurl.data.length === 0) {
      throw 'No songs found for the given search query.';
    }

    let downloadUrl = null;
    let songTitle = null;
    let failedAttempts = 0;

    for (let i = 0; i < spurl.data.length; i++) {
      const song = spurl.data[i];
      const songUrl = song.url;
      
      if (songUrl) {
        let dlres = await fetch(`https://global-tech-api.vercel.app/spotifydl?url=${songUrl}`);
        dlres = await dlres.json();
        console.log('Spotify Download API Response:', dlres);

        if (dlres.status && dlres.data && dlres.data.url && dlres.data.thumbnail) {
          downloadUrl = dlres.data.url;
          songTitle = song.title;
          break;
        } else {
          failedAttempts++;
          if (failedAttempts >= spurl.data.length) {
            throw 'All download attempts failed. Please try again later.';
          }
        }
      }
    }

    if (!downloadUrl) {
      throw 'Download link or thumbnail not found for the song.';
    }

    let doc = {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      ptt: true,
      waveform: [100, 0, 100, 0, 100, 0, 100],
      fileName: `${songTitle}.mp3`,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: '↺ |◁   II   ▷|   ♡',
          body: `Now playing: ${songTitle}`,
          thumbnailUrl: dlres.data.thumbnail,
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    };

    await conn.sendMessage(m.chat, doc, { quoted: m });
  } catch (error) {
    console.error('Error occurred:', error);
    throw `Something went wrong: ${error}`;
  }
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|song)$/i;

export default handler;
