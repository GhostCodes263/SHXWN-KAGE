const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'choose',
  aliases: ['pick'],
  category: 'utility',
  description: 'Choose a random option from a list',
  usage: '.choose option1, option2, option3',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const input = ctx.args.join(' ');
    if (!input) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('CHOOSE', [styledLine('Error', 'Provide options')].join('\n'))
      });
      return;
    }
    const options = input.split(',').map((s) => s.trim()).filter(Boolean);
    if (options.length === 0) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('CHOOSE', [styledLine('Error', 'No valid options')].join('\n'))
      });
      return;
    }
    const choice = options[Math.floor(Math.random() * options.length)];
    const lines = [
      styledLine('Options', options.join(', ')),
      styledLine('Choice', choice)
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('CHOOSE', lines)
    });
  }
};
