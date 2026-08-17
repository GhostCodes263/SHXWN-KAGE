const { getSession, deleteSession, setRecord, getRecord } = require('../../verification/verificationStore');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'approveverify',
  aliases: ['approve'],
  category: 'verification',
  description: 'Approve a pending verification session',
  usage: '.approveverify <jid>',
  permissions: ['ADMIN'],
  cooldown: 3,
  execute: async (ctx) => {
    const targetJid = ctx.args[0];
    if (!targetJid) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('APPROVE VERIFY', [
          styledLine('Error', 'Provide JID')
        ].join('\n'))
      });
      return;
    }
    const session = getSession(targetJid);
    if (!session) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('APPROVE VERIFY', [
          styledLine('Error', 'Session not found')
        ].join('\n'))
      });
      return;
    }
    const record = {
      userJid: targetJid,
      ...session.data,
      status: 'APPROVED',
      submittedAt: session.submittedAt,
      reviewedAt: Date.now()
    };
    setRecord(targetJid, record);
    deleteSession(targetJid);
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('APPROVE VERIFY', [
        styledLine('Status', 'VERIFIED')
      ].join('\n'))
    });
  }
};
