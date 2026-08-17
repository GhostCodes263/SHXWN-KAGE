const { commandBox, styledLine } = require('../../utils/format');
const { addBadWord, removeBadWord, getBadWords } = require('../../utils/badWordStore');

module.exports = {
  name: 'badword',
  aliases: ['bw'],
  category: 'moderation',
  description: 'Manage bad word blacklist (add/remove/list)',
  usage: '.badword <add|remove|list> [word]',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const subcommand = ctx.args[0]?.toLowerCase();
    const word = ctx.args.slice(1).join(' ');

    if (!subcommand) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('BADWORD', [
          styledLine('Usage', '.badword add <word>'),
          styledLine('Usage', '.badword remove <word>'),
          styledLine('Usage', '.badword list')
        ].join('\n'))
      });
      return;
    }

    if (subcommand === 'add') {
      if (!word) {
        await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
          text: commandBox('BADWORD', [styledLine('Error', 'Provide a word')].join('\n'))
        });
        return;
      }
      addBadWord(word);
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('BADWORD', [styledLine('Status', 'WORD ADDED')].join('\n'))
      });
    } else if (subcommand === 'remove') {
      if (!word) {
        await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
          text: commandBox('BADWORD', [styledLine('Error', 'Provide a word')].join('\n'))
        });
        return;
      }
      removeBadWord(word);
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('BADWORD', [styledLine('Status', 'WORD REMOVED')].join('\n'))
      });
    } else if (subcommand === 'list') {
      const words = getBadWords();
      if (!words.length) {
        await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
          text: commandBox('BADWORDS', [styledLine('Status', 'NO BAD WORDS')].join('\n'))
        });
        return;
      }
      const lines = words.map((w, i) => `┃ [${i + 1}] ${w}`).join('\n');
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('BADWORDS', lines)
      });
    } else {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('BADWORD', [styledLine('Error', 'Invalid subcommand')].join('\n'))
      });
    }
  }
};
