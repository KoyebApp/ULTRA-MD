import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply("Enter the name of the app to search for the mod.");
  }

  try {
    const results = await modCombo(text);

    if (results.length === 0) {
      return m.reply("No mods were found for the application you were looking for.");
    }

    let caption = `Search results for *${text}*:\n\n`;

    results.forEach((result, index) => {
      if (result.title && result.link && result.date && result.image) {
        caption += `
${index + 1}. *Title:* ${result.title}
*Link:* ${result.link}
*Date:* ${result.date}
*Image:* ${result.image}
\n`;
      }
    });

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
  } catch (error) {
    console.error("Error in search modapk:", error);
    m.reply("An error occurred while searching for mods.");
  }
};

async function modCombo(apk) {
  try {
    const ress = await axios.get(`https://modcombo.com/id/?s=${apk}`);
    const $ = cheerio.load(ress.data);

    const results = [];

    $('ul.blogs.w3 > li').each((index, element) => {
      const link = $(element).find('a.blog.search').attr('href') || null;
      const title = $(element).find('div.title').text().trim() || 'No Title';
      const image = $(element).find('img.thumb').attr('data-src') || $(element).find('img.thumb').attr('src') || null;
      const time = $(element).find('time').attr('datetime') || null;

      if (link && title && image && time) {
        const date = new Date(time);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        results.push({ title, link, image, date: formattedDate });
      }
    });

    return results;
  } catch (error) {
    console.error('Error in modCombo:', error.message);
    return [{ error: `Error fetching data: ${error.message}` }];
  }
}

handler.help = ['modapk'];
handler.tags = ['search'];
handler.command = /^(mod|apk)$/i;
handler.group = false;

export default handler;
