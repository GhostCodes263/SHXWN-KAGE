const { commandBox, styledLine } = require('../../utils/format');
const { addWarning, getWarningCount } = require('../../utils/warningStore');

module.exports = {
  name: 'warn',
  aliases: ['warning'],
  category: 'moderation',
  description: 'Warn a user in the group',
  usage: '.warn @user [reason]',
  permissions: ['ADMIN'],
  cooldown: 3,
  groupOnly: true,
  execute: async (ctx) => {
    const mentioned = ctx.normalized.mentionedJids;
    if (!mentioned.length) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('WARN', [styledLine('Error', 'Mention a user')].join('\n'))
      });
      return;
    }
    const target = mentioned[0];
    const reason = ctx.args.slice(1).join(' ') || 'No reason provided';
    const count = addWarning(ctx.normalized.remoteJid, target, reason, ctx.normalized.sender);
    const lines = [
      styledLine('User', target.replace('@s.whatsapp.net', '')),
      styledLine('Reason', reason),
      styledLine('Warnings', String(count))
    ].join('\n');
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('WARN', lines)
    });
  }
};
