const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'info',
  aliases: ['botinfo', 'about'],
  category: 'utility',
  description: 'Show bot information',
  usage: '.info',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const lines = [
      styledLine('Bot', ctx.config.botName),
      styledLine('Owner', ctx.config.ownerName),
      styledLine('Mode', ctx.config.environment.toUpperCase()),
      styledLine('Prefix', ctx.config.botPrefix),
      styledLine('Engine', 'NODE.JS'),
      styledLine('Status', 'ONLINE')
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('INFO', lines)
    });
  }
};
