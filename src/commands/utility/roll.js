const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'roll',
  aliases: ['dice'],
  category: 'utility',
  description: 'Roll a dice (default 6 sides)',
  usage: '.roll [sides]',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const sides = parseInt(ctx.args[0], 10) || 6;
    if (sides < 2 || sides > 1000) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('ROLL', [styledLine('Error', 'Sides must be 2-1000')].join('\n'))
      });
      return;
    }
    const result = Math.floor(Math.random() * sides) + 1;
    const lines = [
      styledLine('Sides', String(sides)),
      styledLine('Result', String(result))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('ROLL', lines)
    });
  }
};
