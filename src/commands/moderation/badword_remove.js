const { commandBox, styledLine } = require('../../utils/format');
const { removeBadWord } = require('../../utils/badWordStore');

module.exports = {
  name: 'badword-remove',
  aliases: ['bwremove', 'removebadword'],
  category: 'moderation',
  description: 'Remove a bad word from the blacklist',
  usage: '.badword remove <word>',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const word = ctx.args.join(' ');
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
  }
};
