import fetch from 'node-fetch';
import axios from 'axios';

// Utility function for retrying the fetch request
async function fetchWithRetry(url, options, retries = 5, delay = 5000) {
  try {
    const response = await fetchWithTimeout(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
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

// Fetch with timeout logic
async function fetchWithTimeout(url, options, timeout = 15000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeout)
  );
  const fetchPromise = fetch(url, options);
  const response = await Promise.race([fetchPromise, timeoutPromise]);
  return response;
}

// Fallback function using Axios if fetch fails
async function fetchWithAxios(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Axios failed: ${error.message}`);
  }
}

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw 'You need to provide the URL of the Facebook video.';

  m.react('⌛'); // Indicating that the bot is processing the request

  // Prepare the fetch request options, including headers
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  };

  let res;
  try {
    // Try fetching using node-fetch
    res = await fetchWithRetry(`https://global-tech-api.vercel.app/fbvideo?url=${encodeURIComponent(text)}`, options);
  } catch (error) {
    // If node-fetch fails, try using Axios
    console.log('node-fetch failed, attempting with Axios');
    try {
      res = await fetchWithAxios(`https://global-tech-api.vercel.app/fbvideo?url=${encodeURIComponent(text)}`);
    } catch (error) {
      throw `An error occurred while fetching the video: ${error.message}`;
    }
  }

  // Log the API response for debugging purposes
  console.log("API Response:", JSON.stringify(res, null, 2));

  // Ensure the response contains valid video data
  if (!res || !res.result || (!res.result.hd && !res.result.sd)) {
    throw 'No video found or invalid response from the API.';
  }

  // Choose the highest quality video available
  const videoURL = res.result.hd || res.result.sd;

  m.react('✅'); // Indicating that the video is ready to be sent

  // Send the video to the user
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
  
