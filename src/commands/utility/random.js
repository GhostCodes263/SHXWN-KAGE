const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'random',
  aliases: ['rand'],
  category: 'utility',
  description: 'Generate a random number between min and max',
  usage: '.random <min> <max>',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const min = parseInt(ctx.args[0], 10);
    const max = parseInt(ctx.args[1], 10);
    if (isNaN(min) || isNaN(max)) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('RANDOM', [styledLine('Error', 'Usage: .random min max')].join('\n'))
      });
      return;
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    const lines = [
      styledLine('Range', `${min} - ${max}`),
      styledLine('Result', String(result))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('RANDOM', lines)
    });
  }
};
