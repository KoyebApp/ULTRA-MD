import axios from 'axios';

// Utility function for retrying the fetch request
async function fetchWithRetry(url, options, retries = 3, delay = 3000) {
  try {
    const response = await axios(url, options); // Use Axios to fetch the data
    return response.data; // Axios automatically parses JSON, so we can use the data directly
  } catch (error) {
    if (retries > 0) {
      console.log(`Fetch failed, retrying... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay)); // Delay before retry
      return fetchWithRetry(url, options, retries - 1, delay); // Retry the request
    } else {
      throw new Error(`Failed after retries: ${error.message}`);
    }
  }
}

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw 'You need to provide the URL of the Facebook video.';
  m.reply('Please wait...');

  // Prepare the fetch request options, including headers
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  };

  let res;
  try {
    // Use Axios with retry logic
    res = await fetchWithRetry(`https://global-tech-api.vercel.app/fbvideo?url=${text}`, options);
  } catch (error) {
    throw `An error occurred while fetching the video: ${error.message}`;
  }

  // Log the API response for debugging purposes
  console.log("API Response:", JSON.stringify(res, null, 2)); // Full response to the console

  // Check if the response contains the necessary keys
  if (!res || !res.result) {
    console.log('Invalid or empty result:', res);
    throw 'No video found or invalid response from API.';
  }

  // Determine if HD or SD video URLs are available
  const hdVideo = res.result.hd;
  const sdVideo = res.result.sd;

  if (!hdVideo && !sdVideo) {
    console.log('No video URL found in response:', res.result);
    throw 'No video available to download.';
  }

  // Determine which video URL to send: prioritize HD, fall back to SD
  const videoURL = hdVideo || sdVideo;

  // Send the video file
  const cap = 'Here is the video you requested:';
  conn.sendFile(m.chat, videoURL, 'video.mp4', cap, m);
};

handler.help = ['Facebook'];
handler.tags = ['downloader'];
handler.command = /^(facebook|fb|fbdl)$/i;

export default handler;
