let handler = async (m, { conn }) => {
  // Get all admins of the group
  let admins = await conn.groupMetadata(m.chat).then(group => group.participants.filter(participant => participant.admin === "admin").map(admin => admin.id));
  
  // Get all participants in the group
  let participants = await conn.groupMetadata(m.chat).then(group => group.participants);
  
  // Filter out admins (owners) and the bot itself
  let users = participants
    .map(participant => participant.id)
    .filter(user => !(admins.includes(user) || user === conn.user.jid));

  // Kick all filtered users
  for (let user of users) {
    if (user.endsWith('@s.whatsapp.net')) {
      await conn.groupParticipantsUpdate(m.chat, [user], "remove");
    }
  }
};
handler.help = ['kickall'];
handler.tags = ['admin'];
handler.command = /^(kickall)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
