const { commandBox, styledLine } = require('../../utils/format');
const { getBadWords } = require('../../utils/badWordStore');

module.exports = {
  name: 'badword-list',
  aliases: ['bwlist', 'listbadwords'],
  category: 'moderation',
  description: 'List all bad words in the blacklist',
  usage: '.badword list',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
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
  }
};
