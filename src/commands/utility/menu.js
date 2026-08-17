const { commandBox, styledLine } = require('../../utils/format');
const { getCommandsByCategory } = require('../../handlers/commandHandler');

module.exports = {
  name: 'menu',
  aliases: ['categories'],
  category: 'utility',
  description: 'Show available command categories',
  usage: '.menu [category]',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const grouped = getCommandsByCategory();
    const requestedCategory = ctx.args[0]?.toLowerCase();

    if (requestedCategory) {
      const commandsInCategory = grouped.get(requestedCategory) || [];
      if (!commandsInCategory.length) {
        await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
          text: commandBox('MENU', [
            styledLine('Category', requestedCategory),
            '┃ No commands found.'
          ].join('\n'))
        });
        return;
      }
      const output = commandBox('MENU', [
        styledLine('Category', requestedCategory),
        '┃',
        ...commandsInCategory.map((c) => `┃ • ${c}`)
      ].join('\n'));
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, { text: output });
    } else {
      const lines = [];
      for (const category of grouped.keys()) {
        lines.push(`┃ • ${category.toUpperCase()}`);
      }
      const output = commandBox('CATEGORIES', lines.join('\n'));
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, { text: output });
    }
  }
};
