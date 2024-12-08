import fetch from 'node-fetch'
import displayLoadingScreen from '../lib/loading.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    console.log('No song name provided.')
    throw `*Please enter a song name*`
  }
  m.react('🎶')
  
  let pp = 'https://wallpapercave.com/wp/wp7932387.jpg'
  const query = encodeURIComponent(text)
  let res = `https://global-tech-api.vercel.app/spotifysearch?query=${query}`

  try {
    // Fetch search results
    let spurl = await fetch(res)
    spurl = await spurl.json()

    // Ensure the data exists and contains the necessary URL
    if (!spurl.data || spurl.data.length === 0 || !spurl.data[0].url) {
      throw 'Song not found or missing URL.'
    }

    // Fetch download link using the URL from search result
    let dlres = await fetch(`https://global-tech-api.vercel.app/spotifydl?url=${spurl.data[0].url}`)
    dlres = await dlres.json()

    // Ensure download response has the correct data
    if (!dlres.data || !dlres.data.url) {
      throw 'Download link not found.'
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

    // Send the message with audio file
    await conn.sendMessage(m.chat, doc, { quoted: m })
  } catch (error) {
    console.error('Error:', error)
    throw `Something went wrong: ${error}`
  }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^(spotify|song)$/i

export default handler
