const { startJoingroup } = require('../../verification/verificationEngine');

module.exports = {
  name: 'verify',
  aliases: ['verifyme', 'startverify'],
  category: 'verification',
  description: 'Start verification to join a group',
  usage: '.verify',
  permissions: ['USER'],
  cooldown: 3,
  privateOnly: true,
  execute: async (ctx) => {
    await startJoingroup(ctx);
  }
};
