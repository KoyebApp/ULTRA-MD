import pkg from 'nayan-media-downloader';
const { tikdown } = pkg;

const handler = async (message, { conn, text, args, usedPrefix, command }) => {
    // Define error messages for easier reference
    const errorMessages = {
        noUrl: "Please provide a TikTok URL.",
        invalidUrl: "The provided URL is not a TikTok link.",
        errorFetching: "Error fetching video data.",
        successMessage: "✅ Video has been downloaded successfully.",
        errorOccurred: "❌ An unexpected error occurred."
    };

    // If no URL is provided in the arguments, check if it's quoted from the message
    if (!args[0] && message.quoted && message.quoted.text) {
        args[0] = message.quoted.text;
    }

    // If no URL is still provided, throw an error
    if (!args[0]) {
        throw new Error(errorMessages.noUrl);
    }

    // Validate that the URL is from TikTok
    if (!args[0].match(/tiktok/gi)) {
        throw new Error(errorMessages.invalidUrl);
    }

    // Notify the user that the video is being fetched
    message.reply('⏳ Fetching TikTok video...');

    try {
        // Fetch the video data using the TikTok URL
        const { data } = await tikdown(args[0]);
        const videoUrl = data?.videoUrl;

        // If no video URL is found in the response, throw an error
        if (!videoUrl) {
            throw new Error(errorMessages.errorFetching);
        }

        // Send the video file to the user
        await conn.sendFile(message.chat, videoUrl, 'tiktok.mp4', errorMessages.successMessage, message);

        // Notify the user of successful download
        message.reply('✅ Video downloaded successfully!');
    } catch (error) {
        // Log the error and notify the user of failure
        console.error(error);
        await message.reply(errorMessages.errorOccurred);
        message.reply('❌ Download failed.');
    }
};

// Define the command and regex for matching the TikTok commands
handler.command = ['tiktok', 'tikdown', 'tiktokdownloader'];
handler.regex = /^t(t|iktok(d(own(load(er)?)?|l))?|td(own(load(er)?)?|l))$/i;

export default handler;
