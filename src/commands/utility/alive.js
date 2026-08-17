const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'alive',
  aliases: ['online', 'status'],
  category: 'utility',
  description: 'Check if the bot is alive',
  usage: '.alive',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const lines = [
      styledLine('Status', 'ONLINE'),
      styledLine('Mode', ctx.config.environment.toUpperCase()),
      styledLine('Prefix', ctx.config.botPrefix),
      styledLine('Threat', 'LOW')
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('SYSTEM STATUS', lines)
    });
  }
};
