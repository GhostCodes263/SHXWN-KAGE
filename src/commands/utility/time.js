const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'time',
  aliases: ['clock'],
  category: 'utility',
  description: 'Get current time (UTC)',
  usage: '.time',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const now = new Date();
    const timeStr = now.toISOString().slice(11, 19);
    const lines = [
      styledLine('Time', timeStr),
      styledLine('Zone', 'UTC')
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('TIME', lines)
    });
  }
};
