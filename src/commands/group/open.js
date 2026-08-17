const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'open',
  aliases: ['unlock'],
  category: 'group',
  description: 'Open group for messages',
  usage: '.open',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      await ctx.sock.groupSettingUpdate(ctx.normalized.remoteJid, 'not_announcement');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP OPENED', [styledLine('Status', 'All members can send messages')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP OPENED', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
