import fetch from 'node-fetch'
import displayLoadingScreen from '../lib/loading.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    console.log('No song name provided.')
    throw `*Please enter a song name*`
  }
  m.react('🎶')
  //await displayLoadingScreen(conn, m.chat)
  
  let pp = 'https://wallpapercave.com/wp/wp7932387.jpg'
  const query = encodeURIComponent(text)
  
  let res = `https://global-tech-api.vercel.app/spotifysearch?query=${query}`
  let spurl = await fetch(res)
  spurl = await spurl.json()

  // Check if spurl.data exists and is an array with at least one element
  if (!spurl.data || spurl.data.length === 0) {
    throw `No results found for "${text}". Please try a different query.`
  }

  // Now, proceed to fetch the download link using the url from the first result
  let dlres = await fetch(`https://global-tech-api.vercel.app/spotifydl?url=${spurl.data[0].url}`)
  dlres = await dlres.json()

  // Check if dlres.data contains a valid URL
  if (!dlres.data || !dlres.data.url) {
    throw `Download URL not found. Please try again later.`
  }

  let sturl = dlres.data.url

  let doc = {
    audio: {
      url: sturl,
    },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'Guru.mp3',
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '↺ |◁   II   ▷|   ♡',
        body: `Now playing: ${text}`,
        thumbnailUrl: dlres.data.thumbnail,
        sourceUrl: null,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  await conn.sendMessage(m.chat, doc, { quoted: m })
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^(spotify|song)$/i

export default handler
