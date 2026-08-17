const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'admins',
  aliases: ['adminlist'],
  category: 'group',
  description: 'List group admins',
  usage: '.admins',
  permissions: ['USER'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      const metadata = await ctx.sock.groupMetadata(ctx.normalized.remoteJid);
      const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const lines = [];
      for (const admin of admins) {
        lines.push(`┃ • ${admin.id.replace('@s.whatsapp.net','')}`);
      }
      const output = commandBox('ADMINS', lines.join('\n') || styledLine('None', 'No admins'));
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, { text: output });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ADMINS', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
