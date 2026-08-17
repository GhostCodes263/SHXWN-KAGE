const { deleteSession } = require('../../verification/verificationStore');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'verify-reset',
  aliases: ['vreset'],
  category: 'verification',
  description: 'Reset your current verification session',
  usage: '.verify-reset',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    deleteSession(ctx.normalized.sender);
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('VERIFY RESET', [
        styledLine('Status', 'SESSION RESET')
      ].join('\n'))
    });
  }
};
