const crypto = require('crypto');
const logger = require('../utils/logger');
const { commandBox, styledLine } = require('../utils/format');
const {
  getSession,
  setSession,
  deleteSession,
  getRecord,
  setRecord,
  getSettings,
  getPendingGroup,
  setPendingGroup,
  clearPendingGroup,
  getRequest,
  setRequest,
  deleteRequest,
  getAllRequests
} = require('./verificationStore');

const STATES = {
  NAME_PENDING: 'NAME_PENDING',
  AGE_PENDING: 'AGE_PENDING',
  GENDER_PENDING: 'GENDER_PENDING',
  LOCATION_PENDING: 'LOCATION_PENDING',
  CONSENT_PENDING: 'CONSENT_PENDING',
  SUBMITTED: 'SUBMITTED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

function createNewSession(userJid, groupJid) {
  return {
    userJid,
    groupJid,
    state: STATES.NAME_PENDING,
    data: {},
    startedAt: Date.now()
  };
}

/**
 * Start verification session from .joingroup or .verify
 */
async function startJoingroup(ctx) {
  const userJid = ctx.normalized.sender;
  const pendingGroup = getPendingGroup(userJid);

  if (!pendingGroup) {
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('JOIN', [
        styledLine('Error', 'No pending group found. Ask admin to add you again.')
      ].join('\n'))
    });
    return;
  }

  const existingRecord = getRecord(userJid);
  if (existingRecord && existingRecord.status === 'APPROVED') {
    await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
      text: commandBox('JOIN', [
        styledLine('Status', 'Already verified. You will be added.')
      ].join('\n'))
    });
    // Add to group directly
    await addUserToGroup(ctx.sock, userJid, pendingGroup);
    clearPendingGroup(userJid);
    return;
  }

  setSession(userJid, createNewSession(userJid, pendingGroup));
  await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
    text: commandBox('JOIN', [
      styledLine('Step', 'NAME'),
      styledLine('Prompt', 'What is your full name?')
    ].join('\n'))
  });
}

/**
 * Handle verification questionnaire input.
 */
async function handleInput(sock, context) {
  const userJid = context.sender;
  const session = getSession(userJid);
  if (!session) return false;

  const text = context.text.trim();
  const state = session.state;

  switch (state) {
    case STATES.NAME_PENDING:
      session.data.name = text;
      session.state = STATES.AGE_PENDING;
      setSession(userJid, session);
      await sock.sendMessage(context.remoteJid, {
        text: commandBox('JOIN', [styledLine('Step', 'AGE'), styledLine('Prompt', 'What is your age?')].join('\n'))
      });
      break;
    case STATES.AGE_PENDING:
      session.data.age = text;
      session.state = STATES.GENDER_PENDING;
      setSession(userJid, session);
      await sock.sendMessage(context.remoteJid, {
        text: commandBox('JOIN', [styledLine('Step', 'GENDER'), styledLine('Prompt', 'What is your gender? (Male/Female/Other)')].join('\n'))
      });
      break;
    case STATES.GENDER_PENDING:
      session.data.gender = text;
      session.state = STATES.LOCATION_PENDING;
      setSession(userJid, session);
      await sock.sendMessage(context.remoteJid, {
        text: commandBox('JOIN', [styledLine('Step', 'LOCATION'), styledLine('Prompt', 'What is your location? (City/Country)')].join('\n'))
      });
      break;
    case STATES.LOCATION_PENDING:
      session.data.location = text;
      session.state = STATES.CONSENT_PENDING;
      setSession(userJid, session);
      await sock.sendMessage(context.remoteJid, {
        text: commandBox('JOIN', [styledLine('Step', 'CONSENT'), styledLine('Prompt', 'Do you consent to store this information? (yes/no)')].join('\n'))
      });
      break;
    case STATES.CONSENT_PENDING: {
      const answer = text.toLowerCase();
      if (answer === 'yes' || answer === 'y') {
        session.state = STATES.SUBMITTED;
        session.submittedAt = Date.now();
        const settings = getSettings();
        if (settings.adminReview) {
          session.state = STATES.PENDING_REVIEW;
        } else {
          session.state = STATES.APPROVED;
        }
        setSession(userJid, session);

        const record = {
          userJid,
          ...session.data,
          status: session.state,
          submittedAt: session.submittedAt,
          reviewedAt: session.state === 'APPROVED' ? Date.now() : null
        };
        setRecord(userJid, record);
        deleteSession(userJid);

        if (session.state === 'PENDING_REVIEW') {
          await sendVerificationRequestToAdmins(sock, userJid, session.groupJid, record);
          await sock.sendMessage(context.remoteJid, {
            text: commandBox('VERIFY', [styledLine('Status', 'PENDING ADMIN APPROVAL')].join('\n'))
          });
        } else {
          await addUserToGroup(sock, userJid, session.groupJid);
          clearPendingGroup(userJid);
          await sock.sendMessage(context.remoteJid, {
            text: commandBox('VERIFY', [styledLine('Status', 'VERIFIED AND ADDED')].join('\n'))
          });
        }
      } else {
        deleteSession(userJid);
        await sock.sendMessage(context.remoteJid, {
          text: commandBox('VERIFY', [styledLine('Status', 'CANCELLED')].join('\n'))
        });
      }
      break;
    }
    default:
      return false;
  }
  return true;
}

/**
 * Send verification request to group admins with Yes/No buttons.
 */
async function sendVerificationRequestToAdmins(sock, userJid, groupJid, record) {
  const metadata = await sock.groupMetadata(groupJid);
  const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
  if (!admins.length) return;

  // Choose first admin (or rotating later)
  const admin = admins[0];
  const requestId = crypto.randomUUID();
  const request = {
    requestId,
    userJid,
    groupJid,
    record,
    adminJid: admin.id,
    sentAt: Date.now(),
    answered: false
  };
  setRequest(requestId, request);

  const messageText = `Verification Request\n\nUser: ${record.name}\nAge: ${record.age}\nGender: ${record.gender}\nLocation: ${record.location}\n\nApprove or reject?`;

  try {
    await sock.sendMessage(admin.id, {
      text: messageText,
      buttons: [
        { buttonId: 'approve', buttonText: { displayText: 'APPROVE' }, type: 1 },
        { buttonId: 'reject', buttonText: { displayText: 'REJECT' }, type: 1 }
      ],
      headerType: 1,
      footer: 'Click a button',
      viewOnce: false,
      linkPreview: false
    });
  } catch (err) {
    logger.warn(`Button message failed, sending plain text: ${err.message}`);
    await sock.sendMessage(admin.id, {
      text: `${messageText}\n\nReply with YES or NO`
    });
  }

  // Schedule resend to another admin if unanswered after 1 day
  setTimeout(async () => {
    const currentRequest = getRequest(requestId);
    if (currentRequest && !currentRequest.answered) {
      // Find another admin
      const metadataNow = await sock.groupMetadata(groupJid);
      const adminsNow = metadataNow.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const otherAdmin = adminsNow.find(a => a.id !== currentRequest.adminJid);
      if (otherAdmin) {
        setRequest(requestId, { ...currentRequest, adminJid: otherAdmin.id, sentAt: Date.now() });
        await sock.sendMessage(otherAdmin.id, { text: `${messageText}\n\nReply YES or NO` });
      } else {
        // Resend to same admin
        await sock.sendMessage(currentRequest.adminJid, { text: `${messageText}\n\nReply YES or NO` });
      }
    }
  }, 24 * 60 * 60 * 1000);
}

/**
 * Handle admin response (button or text).
 */
async function handleAdminResponse(sock, context) {
  const text = context.text.toLowerCase();
  if (!['approve', 'reject', 'yes', 'no', 'y', 'n'].includes(text)) return;

  const allRequests = getAllRequests();
  const request = Object.values(allRequests).find(r => !r.answered && r.adminJid === context.sender);
  if (!request) return;

  request.answered = true;
  request.answer = text;
  setRequest(request.requestId, request);

  if (['approve', 'yes', 'y'].includes(text)) {
    await addUserToGroup(sock, request.userJid, request.groupJid);
    clearPendingGroup(request.userJid);
    await sock.sendMessage(request.userJid, {
      text: commandBox('VERIFY', [styledLine('Status', 'APPROVED AND ADDED TO GROUP')].join('\n'))
    });
    await sock.sendMessage(context.remoteJid, { text: '✅ User approved and added.' });
  } else {
    await sock.sendMessage(request.userJid, {
      text: commandBox('VERIFY', [styledLine('Status', 'REJECTED BY ADMIN')].join('\n'))
    });
    await sock.sendMessage(context.remoteJid, { text: '❌ User rejected.' });
  }
  deleteRequest(request.requestId);
}

/**
 * Add user to group.
 */
async function addUserToGroup(sock, userJid, groupJid) {
  try {
    await sock.groupParticipantsUpdate(groupJid, [userJid], 'add');
    logger.info(`Added ${userJid} to ${groupJid}`);
  } catch (err) {
    logger.error(`Failed to add ${userJid} to ${groupJid}: ${err.message}`);
  }
}

async function verifyStatus(ctx) {
  const userJid = ctx.normalized.sender;
  const session = getSession(userJid);
  const record = getRecord(userJid);
  let status = 'NOT STARTED';
  if (session) status = `IN PROGRESS (${session.state})`;
  else if (record) status = record.status;

  await ctx.sock.sendMessage(ctx.normalized.remoteJid, {
    text: commandBox('VERIFY STATUS', [styledLine('Status', status)].join('\n'))
  });
}

module.exports = {
  startJoingroup,
  handleInput,
  verifyStatus,
  handleAdminResponse,
  STATES
};
