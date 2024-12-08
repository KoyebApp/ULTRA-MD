const axios = require('axios');  // Import axios

// Define the API endpoint
const apiUrl = 'https://global-tech-api.vercel.app/ytdl/ytmp4';

// Function to fetch data from the API
async function fetchYtmp4(queryParams = {}) {
  try {
    // Make a GET request with query parameters (if any)
    const response = await axios.get(apiUrl, { params: queryParams });

    // Return the response data
    return response.data;
  } catch (error) {
    // Handle errors (e.g., network errors, invalid API, etc.)
    console.error('Error fetching from the API:', error.message);
    throw error;  // Re-throw error to be handled by the caller
  }
}

module.exports = fetchYtmp4;
