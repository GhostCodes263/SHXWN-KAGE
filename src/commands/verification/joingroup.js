const { startJoingroup } = require('../../verification/verificationEngine');

module.exports = {
  name: 'joingroup',
  aliases: ['join'],
  category: 'verification',
  description: 'Start verification to join a group',
  usage: '.joingroup',
  permissions: ['USER'],
  cooldown: 3,
  privateOnly: true,
  execute: async (ctx) => {
    await startJoingroup(ctx);
  }
};
