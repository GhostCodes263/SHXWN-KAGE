const { getSession, deleteSession, setRecord } = require('../../verification/verificationStore');
const { commandBox, styledLine } = require('../../utils/format');

module.exports = {
  name: 'rejectverify',
  aliases: ['reject'],
  category: 'verification',
  description: 'Reject a pending verification session',
  usage: '.rejectverify <jid>',
  permissions: ['ADMIN'],
  cooldown: 3,
  execute: async (ctx) => {
    const targetJid = ctx.args[0];
    if (!targetJid) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('REJECT VERIFY', [
          styledLine('Error', 'Provide JID')
        ].join('\n'))
      });
      return;
    }
    const session = getSession(targetJid);
    if (!session) {
      await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
        text: commandBox('REJECT VERIFY', [
          styledLine('Error', 'Session not found')
        ].join('\n'))
      });
      return;
    }
    const record = {
      userJid: targetJid,
      ...session.data,
      status: 'REJECTED',
      submittedAt: session.submittedAt,
      reviewedAt: Date.now()
    };
    setRecord(targetJid, record);
    deleteSession(targetJid);
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('REJECT VERIFY', [
        styledLine('Status', 'REJECTED')
      ].join('\n'))
    });
  }
};
