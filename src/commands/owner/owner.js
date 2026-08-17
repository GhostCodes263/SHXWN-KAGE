const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'owner',
  category: 'owner',
  description: 'Show owner information',
  usage: '.owner',
  permissions: ['OWNER'],
  cooldown: 3,
  execute: async (ctx) => {
    const lines = [
      styledLine('Owner', ctx.config.ownerName),
      styledLine('Number', ctx.config.ownerNumber),
      styledLine('Status', 'SUPREME COMMANDER')
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('OWNER', lines)
    });
  }
};
