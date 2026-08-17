const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'coin',
  aliases: ['flip'],
  category: 'utility',
  description: 'Flip a coin',
  usage: '.coin',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
    const lines = [
      styledLine('Result', result)
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('COIN FLIP', lines)
    });
  }
};
