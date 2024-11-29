let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Usage: ${prefix + command} *linkchannel*`);

  // Check if the URL starts with 'https://whatsapp.com/channel/'
  if (!text.startsWith('https://whatsapp.com/channel/')) {
    return m.reply("Link not valid");
  }

  // React with a loading emoji
  await conn.sendMessage(m.chat, {
    react: {
      text: "⏳",
      key: m.key,
    }
  });

  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  try {
    // Extract the channel ID from the URL by splitting the string after 'https://whatsapp.com/channel/'
    let result = text.split('https://whatsapp.com/channel/')[1];

    // Ensure the result (channel ID) is not empty
    if (!result) {
      return m.reply("Link not valid");
    }

    // Fetch metadata for the channel using the result (channel ID)
    let data = await cioBotz.newsletterMetadata("invite", result);
    
    // If data is not fetched, return a failure message
    if (!data) {
      return m.reply("Failed to fetch channel info, please check the link.");
    }

    // Format the response text with the channel's info
    let teks = `*□ NEWSLETTER INFO*

*Name:* ${data.name}
*ID*: ${data.id}
*Status*: ${data.state}
*Dibuat Pada*: ${formatDate(data.creation_time)}
*Subscribers*: ${data.subscribers}
*Meta Verify*: ${data.verification}
*React Emoji:* ${data.reaction_codes}
*Description*:
${data.description || 'No description available'}
    `;
    m.reply(teks);
  } catch (error) {
    console.error(error);
    m.reply("Link not valid");
  }
};

// Simplified URL validation function
function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch (e) {
    return false;
  }
}

handler.help = ['inspect', 'getch', 'getinfochannel', 'getchid'];
handler.tags = ['info'];
handler.command = /^(inspect|getch|getinfochannel|getchid)$/i;

export default handler;
