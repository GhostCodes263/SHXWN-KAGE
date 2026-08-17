const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'close',
  aliases: ['lock'],
  category: 'group',
  description: 'Close group for new members',
  usage: '.close',
  permissions: ['ADMIN'],
  cooldown: 5,
  groupOnly: true,
  execute: async (ctx) => {
    try {
      await ctx.sock.groupSettingUpdate(ctx.normalized.remoteJid, 'announcement');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP CLOSED', [styledLine('Status', 'Only admins can send messages')].join('\n'))
      });
    } catch (err) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('GROUP CLOSED', [styledLine('Error', err.message)].join('\n'))
      });
    }
  }
};
