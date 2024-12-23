import fetch from 'node-fetch';

// Utility function for retrying the fetch request
async function fetchWithRetry(url, options, retries = 3, delay = 3000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Use arrayBuffer() instead of buffer() to avoid the deprecation warning
    const responseBody = await response.arrayBuffer();
    return responseBody;
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
  if (!text) throw 'You need to give the URL of any Facebook video.';
  m.reply('Please wait...');

  // Prepare the fetch request options, including headers and timeout
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    timeout: 10000, // Set a timeout of 10 seconds
  };

  let res;
  try {
    // Call the fetch function with retry logic
    res = await fetchWithRetry(`https://global-tech-api.vercel.app/fbvideo?url=${text}`, options);
  } catch (error) {
    throw `An error occurred: ${error.message}`;
  }

  // Log the API response for debugging purposes
  console.log("API Response:", JSON.stringify(res, null, 2));

  // Check if the response contains the result object and the necessary video URLs
  if (!res || !res.result || (!res.result.hd && !res.result.sd)) {
    throw 'No video found or invalid response from API.';
  }

  // Determine which video URL to send: prioritize HD, fall back to SD
  const videoURL = res.result.hd || res.result.sd; // Use hd if available, otherwise sd

  // Send the video file
  if (videoURL) {
    const cap = 'Here is the video you requested:';
    conn.sendFile(m.chat, videoURL, 'video.mp4', cap, m);
  } else {
    throw 'No video available to download.';
  }
};

handler.help = ['Facebook'];
handler.tags = ['downloader'];
handler.command = /^(facebook|fb|fbdl)$/i;

export default handler;
