let handler = async (m, { conn, text, command }) => {
  // Check if the text is provided
  if (!text) return m.reply(`Usage ${prefix + command} *linkchannel*`);

  // Check if the text is a valid URL or contains the required substring
  function isUrl(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?\\.)+[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?|localhost|\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|\\[?[A-F0-9]*:[A-F0-9]*\\]?)' + // domain name and IP
      '(\\:[0-9]+)?' + // port
      '(\\/[-A-Z0-9+&@#/%=~_|$?!,;]*[^\\.,;\\s])?', 'i');
    return pattern.test(str);
  }

  if (!isUrl(text) && !text.includes('whatsapp.com/channel')) return m.reply("Link not valid");
  
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
    let teks = `*□ NEWSLETTER INFO*

*Name:* ${data.name}
*ID*: ${data.id}
*Status*: ${data.state}
*Dibuat Pada*: ${formatDate(data.creation_time)}
*Subscribers*: ${data.subscribers}
*Meta Verify*: ${data.verification}
*React Emoji:* ${data.reaction_codes}
*Description*:
${data.description}
    `;
    m.reply(teks);
  } catch (error) {
    m.reply("Link not valid");
  }
};

handler.help = ['inspect', 'getch', 'getinfochannel', 'getchid'];
handler.tags = ['info'];
handler.command = /^(inspect|getch|getinfochannel|getchid)$/i;

export default handler;
