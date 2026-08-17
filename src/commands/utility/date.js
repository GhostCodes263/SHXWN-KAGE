const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'date',
  aliases: ['today'],
  category: 'utility',
  description: 'Get current date',
  usage: '.date',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const lines = [
      styledLine('Date', dateStr),
      styledLine('Day', now.toUTCString().slice(0, 3))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('DATE', lines)
    });
  }
};
