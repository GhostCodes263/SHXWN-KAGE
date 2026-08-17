const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'membercount',
  aliases: ['count'],
  category: 'group',
  description: 'Get group member count',
  usage: '.membercount',
  permissions: ['USER'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      const metadata = await ctx.sock.groupMetadata(ctx.normalized.remoteJid);
      const count = metadata.participants.length;
      const lines = [
        styledLine('Members', String(count))
      ].join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('MEMBER COUNT', lines)
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('MEMBER COUNT', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
