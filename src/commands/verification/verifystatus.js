const { verifyStatus } = require('../../verification/verificationEngine');

module.exports = {
  name: 'verify-status',
  aliases: ['verification-status', 'vstatus'],
  category: 'verification',
  description: 'Check your verification status',
  usage: '.verify-status',
  permissions: ['USER'],
  cooldown: 3,
  execute: async (ctx) => {
    await verifyStatus(ctx);
  }
};
