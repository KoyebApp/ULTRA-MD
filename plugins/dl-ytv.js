import axios from 'axios';

// Function to retry fetching media content
const fetchWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios(url);
            if (response.status === 200) return response;
            console.log(`Retrying... (${i + 1})`);
        } catch (error) {
            console.log(`Error fetching data. Retrying... (${i + 1})`);
        }
    }
    throw new Error('Failed to fetch media content after retries');
};

const handler = async (m, { args, conn, usedprefix }) => {
    // Check if a URL was provided
    if (!args.length) {
        await m.reply('Please provide a YouTube URL.');
        return;
    }

    const url = args.join(' '); // Join arguments to handle spaces in URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

    // Validate the URL format
    if (!youtubeRegex.test(url)) {
        await m.react('❌'); // React with a cross emoji for invalid URL
        await m.reply('Invalid YouTube URL. Please provide a valid URL.');
        return;
    }

    await m.react('⏳'); // React with a loading emoji

    try {
        // Check if it's a Shorts URL and convert it to a regular video URL
        let videoUrl = url;

        if (url.includes('youtube.com/shorts/')) {
            const videoId = url.split('/').pop().split('?')[0];  // Extract video ID from Shorts URL
            videoUrl = `https://youtube.com/watch?v=${videoId}`;  // Create the correct video URL
        }

        console.log('Original URL:', url);
        console.log('Converted URL:', videoUrl);
        
        // Encode the video URL
        const video_url = encodeURIComponent(videoUrl);
        
        // Construct the API URL with 'video_url' query parameter
        const apiUrl = `https://global-tech-api.vercel.app/ytdl/ytmp4?video_url=${video_url}`;
        
        console.log('API URL:', apiUrl); // Log the final URL being sent

        // Call your API to get the video details
        const response = await axios.get(apiUrl);

        console.log('API Response:', response.data); // Log the API response for debugging

        // Check if the response contains the necessary data
        if (!response || !response.data || response.data.status === false) {
            throw new Error(response.data.msg || 'Error fetching video details');
        }

        // Get the video URL and other metadata from the API response
        const videoUrlFromApi = response.data.video_url; // Use video URL from the response
        const title = response.data.title || 'video'; // Video title from the response
        const creator = response.data.creator || 'Unknown Creator';
        const description = response.data.description || 'No description available';
        const caption = `Powered by ULTRA-MD | Title: ${title} | Creator: ${creator}`;

        // Fetch the video file with retry logic
        const mediaResponse = await fetchWithRetry(videoUrlFromApi);

        if (!mediaResponse) {
            throw new Error('Failed to fetch the media content');
        }

        const contentType = mediaResponse.headers['content-type'];
        if (!contentType || !contentType.includes('video')) {
            throw new Error('Invalid content type received');
        }

        const arrayBuffer = await mediaResponse.arrayBuffer();
        const mediaBuffer = Buffer.from(arrayBuffer);
        if (mediaBuffer.length === 0) throw new Error('Downloaded file is empty');

        // Send the video file
        await conn.sendFile(m.chat, mediaBuffer, `${title}.mp4`, caption, m, false, {
            mimetype: 'video/mp4'
        });

        await m.react('✅'); // React with a checkmark emoji for success
    } catch (error) {
        console.error('Error fetching video:', error.message, error.stack);
        await m.reply(`An error occurred: ${error.message}`);
        await m.react('❌'); // React with a cross emoji for errors
    }
};

// Metadata for the command handler
handler.help = ['ytmp4', 'ytv'];
handler.tags = ['dl'];
handler.command = ['ytmp4', 'ytv'];

export default handler;
