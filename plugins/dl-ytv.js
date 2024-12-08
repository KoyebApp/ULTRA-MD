import axios from 'axios'; // Importing axios to make HTTP requests

// Function to fetch media content with retries
const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios(url, options);
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
        // Construct the API URL to call your endpoint
        const apiUrl = `https://global-tech-api.vercel.app/ytdl/ytmp4?video_url=${encodeURIComponent(url)}`;
        
        // Call your API to get the video details
        const response = await axios.get(apiUrl); 

        console.log('API Response:', response.data); // Log the API response

        // Check if the response contains the necessary data
        if (!response || !response.data || response.data.status === false) {
            throw new Error(response.data.msg || 'Error fetching video details');
        }

        if (!response.data.video_url) {
            throw new Error('HD video URL not found.');
        }

        const videoUrl = response.data.video_url; // Use video URL from the response
        const title = response.data.title || 'video'; // Video title from the response
        const caption = `Powered by ULTRA-MD | Title: ${title}`;

        // Fetch the video file with retry logic
        const mediaResponse = await fetchWithRetry(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        const contentType = mediaResponse.headers['content-type'];
        if (!contentType || !contentType.includes('video')) {
            throw new Error('Invalid content type received');
        }

        const arrayBuffer = await mediaResponse.arrayBuffer();
        const mediaBuffer = Buffer.from(arrayBuffer);
        if (mediaBuffer.length === 0) throw new Error('Downloaded file is empty');

        // Send the video file
        await conn.sendFile(m.chat, mediaBuffer, `null`, caption, m, false, {
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
