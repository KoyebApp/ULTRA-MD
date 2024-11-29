let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Usage: ${prefix + command} *linkchannel*`);
  
  // Validate the URL
  if (!isUrl(text) || !text.includes('whatsapp.com/channel')) return m.reply("Link not valid");

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
    let result = text.split('https://whatsapp.com/channel/')[1];
    let data = await cioBotz.newsletterMetadata("invite", result);
    
    if (!data) {
      return m.reply("Failed to fetch channel info, please check the link.");
    }

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

// Helper function to validate URL
function isUrl(text) {
  const regex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
  return regex.test(text);
}

handler.help = ['inspect', 'getch', 'getinfochannel', 'getchid'];
handler.tags = ['info'];
handler.command = /^(inspect|getch|getinfochannel|getchid)$/i;

export default handler;
