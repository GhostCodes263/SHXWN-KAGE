const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'myperm',
  aliases: ['mylevel', 'perm'],
  category: 'utility',
  description: 'Check your permission level',
  usage: '.myperm',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const lines = [
      styledLine('JID', ctx.normalized.sender),
      styledLine('Level', ctx.permission.level),
      styledLine('Priority', String(ctx.permission.priority))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('PERMISSIONS', lines)
    });
  }
};
