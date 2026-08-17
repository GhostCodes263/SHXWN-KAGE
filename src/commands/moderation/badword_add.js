const { commandBox, styledLine } = require('../../utils/format');
const { addBadWord } = require('../../utils/badWordStore');

module.exports = {
  name: 'badword-add',
  aliases: ['bwadd', 'addbadword'],
  category: 'moderation',
  description: 'Add a bad word to the blacklist',
  usage: '.badword add <word>',
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
    addBadWord(word);
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('BADWORD', [styledLine('Status', 'WORD ADDED')].join('\n'))
    });
  }
};
