import fetch from 'node-fetch'
import displayLoadingScreen from '../lib/loading.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    console.log('No song name provided.')
    throw `*Please enter a song name*`
  }
  
  m.react('🎶')
  
  // Optional loading screen display (you can uncomment it if needed)
  // await displayLoadingScreen(conn, m.chat)
  
  let pp = 'https://wallpapercave.com/wp/wp7932387.jpg'
  const query = encodeURIComponent(text)

  try {
    // Searching for the song on the Spotify search API
    let res = `https://global-tech-api.vercel.app/spotifysearch?query=${query}`
    let spurlResponse = await fetch(res)
    if (!spurlResponse.ok) {
      throw new Error('Failed to fetch song data from Spotify search API.')
    }
    let spurl = await spurlResponse.json()

    if (!spurl.data || spurl.data.length === 0) {
      throw new Error('No songs found for the provided search query.')
    }

    // Fetching the download link from the Spotify download API
    let dlresResponse = await fetch(`https://global-tech-api.vercel.app/spotifydl?url=${spurl.data[0].url}`)
    if (!dlresResponse.ok) {
      throw new Error('Failed to fetch song download link from Spotify download API.')
    }
    let dlres = await dlresResponse.json()

    if (!dlres.data || !dlres.data.url) {
      throw new Error('Failed to retrieve download URL for the song.')
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

    // Sending the audio message to the chat
    await conn.sendMessage(m.chat, doc, { quoted: m })
  } catch (error) {
    console.error('Error:', error.message)
    throw `*Error occurred:* ${error.message}`
  }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^(spotify|song)$/i

export default handler
