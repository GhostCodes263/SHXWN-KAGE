const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'groupinfo',
  aliases: ['chatinfo', 'gcinfo'],
  category: 'group',
  description: 'Get group information',
  usage: '.groupinfo',
  permissions: ['USER'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      const metadata = await ctx.sock.groupMetadata(ctx.normalized.remoteJid);
      const lines = [
        styledLine('Name', metadata.subject),
        styledLine('Description', metadata.desc || 'No description'),
        styledLine('Members', String(metadata.participants.length)),
        styledLine('Created', new Date(metadata.creation * 1000).toISOString().slice(0, 10))
      ].join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP INFO', lines)
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP INFO', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
