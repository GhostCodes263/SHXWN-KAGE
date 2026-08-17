const { commandBox, styledLine } = require('../../utils/format');
const { getCommandsByCategory } = require('../../handlers/commandHandler');

module.exports = {
  name: 'help',
  aliases: ['commands', 'list'],
  category: 'utility',
  description: 'List all available commands grouped by category',
  usage: '.help [category]',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    const grouped = getCommandsByCategory();
    const requestedCategory = ctx.args[0]?.toLowerCase();

    let output = '';
    if (requestedCategory) {
      const commandsInCategory = grouped.get(requestedCategory) || [];
      if (!commandsInCategory.length) {
        await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
          text: commandBox('HELP', [
            styledLine('Category', requestedCategory),
            '┃ No commands found.'
          ].join('\n'))
        });
        return;
      }
      output = commandBox('HELP', [
        styledLine('Category', requestedCategory),
        '┃',
        ...commandsInCategory.map((c) => `┃ • ${c}`)
      ].join('\n'));
    } else {
      const lines = [];
      for (const [category, cmds] of grouped) {
        lines.push(`┃ [${category.toUpperCase()}]`);
        for (const c of cmds) {
          lines.push(`┃   • ${c}`);
        }
        lines.push('┃');
      }
      output = commandBox('HELP', lines.join('\n'));
    }

    await ctx.sock.sendMessage(ctx.normalized.remoteJid, { text: output });
  }
};
