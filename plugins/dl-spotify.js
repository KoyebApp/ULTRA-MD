import fetch from 'node-fetch'
import displayLoadingScreen from '../lib/loading.js'

let handler = async (m, { conn, text }) => {
  if (!text) {
    console.log('No song name provided.')
    throw '*Please enter a song name*'
  }

  m.react('🎶')

  // Create a URL-safe query for the song search
  const query = encodeURIComponent(text)
  const searchUrl = `https://global-tech-api.vercel.app/spotifysearch?query=${query}`

  try {
    // Fetch the search results from the Spotify API
    let spurl = await fetch(searchUrl)
    spurl = await spurl.json()

    // Log the search API response for debugging
    console.log('Spotify Search API Response:', spurl)

    // Check if the search results contain valid data
    if (!spurl.data || spurl.data.length === 0) {
      throw 'No songs found for the given search query.'
    }

    // Loop through the search results to find a valid download URL
    let downloadUrl = null
    let songTitle = null
    for (let i = 0; i < spurl.data.length; i++) {
      const song = spurl.data[i]
      const songUrl = song.url
      if (songUrl) {
        // Fetch the download link using the song URL
        let dlres = await fetch(`https://global-tech-api.vercel.app/spotifydl?url=${songUrl}`)
        dlres = await dlres.json()

        // Log the download API response for debugging
        console.log('Spotify Download API Response:', dlres)

        // Check if the download response contains the necessary URL and thumbnail
        if (dlres.status && dlres.data && dlres.data.url && dlres.data.thumbnail) {
          downloadUrl = dlres.data.url
          songTitle = song.title
          break // Exit the loop if a valid download URL is found
        }
      }
    }

    // If no valid download URL is found, throw an error
    if (!downloadUrl) {
      throw 'Download link or thumbnail not found for the song.'
    }

    // Prepare the audio message object
    let doc = {
      audio: {
        url: downloadUrl,
      },
      mimetype: 'audio/mpeg',
      ptt: true,
      waveform: [100, 0, 100, 0, 100, 0, 100],
      fileName: `${songTitle}.mp3`, // Dynamically name the file based on the song title

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
    }

    // Send the audio message to the chat
    await conn.sendMessage(m.chat, doc, { quoted: m })
  } catch (error) {
    console.error('Error occurred:', error)
    throw `Something went wrong: ${error}`
  }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^(spotify|song)$/i

export default handler
