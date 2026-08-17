const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');
const { getPermissionLevel, hasPermission } = require('../utils/permissions');
const { commandBox, styledLine } = require('../utils/format');

const commands = new Map();
const aliases = new Map();
const cooldowns = new Map();

function loadCommands() {
  const commandsDir = path.resolve(config.rootDir, 'src', 'commands');
  const categories = fs.readdirSync(commandsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const category of categories) {
    const categoryPath = path.join(commandsDir, category);
    const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      try {
        const command = require(filePath);

        if (!command.name || typeof command.execute !== 'function') {
          logger.warn(`Command file ${filePath} is missing name or execute`);
          continue;
        }

        command.category = command.category || category;
        command.aliases = command.aliases || [];
        command.permissions = command.permissions || ['USER'];
        command.cooldown = typeof command.cooldown === 'number' ? command.cooldown : 3;

        commands.set(command.name.toLowerCase(), command);

        for (const alias of command.aliases) {
          aliases.set(alias.toLowerCase(), command.name.toLowerCase());
        }

        logger.debug(`Loaded command: ${command.name} (${category})`);
      } catch (err) {
        logger.error(err, `Failed to load command: ${filePath}`);
      }
    }
  }

  logger.info(`Commands loaded: ${commands.size}`);
}

async function handleCommand(sock, normalizedMessage) {
  const { text } = normalizedMessage;

  if (!text || !text.startsWith(config.botPrefix)) return;

  const body = text.slice(config.botPrefix.length).trim();
  if (!body) return;

  const [commandName, ...args] = body.split(/\s+/);
  const lowerName = commandName.toLowerCase();

  let targetName = lowerName;
  if (aliases.has(lowerName)) {
    targetName = aliases.get(lowerName);
  }

  if (!commands.has(targetName)) {
    return; // Unknown command
  }

  const command = commands.get(targetName);
  const userId = normalizedMessage.sender;

  // Permission check
  const permission = getPermissionLevel({ normalized: normalizedMessage });
  if (!hasPermission(permission.level, command.permissions)) {
    const denial = commandBox('ACCESS DENIED', [
      styledLine('Command', command.name),
      styledLine('Required', command.permissions.join(', ')),
      styledLine('Your Level', permission.level)
    ].join('\n'));
    await sock.sendMessage(normalizedMessage.remoteJid, { text: denial });
    logger.warn(`Denied ${command.name} for ${userId} (level: ${permission.level})`);
    return;
  }

  // Cooldown check
  const cooldownKey = `${userId}:${command.name}`;
  const now = Date.now();
  if (cooldowns.has(cooldownKey)) {
    const expiry = cooldowns.get(cooldownKey);
    if (now < expiry) {
      const remaining = Math.ceil((expiry - now) / 1000);
      await sock.sendMessage(normalizedMessage.remoteJid, {
        text: `⏳ Cooldown: ${remaining}s remaining.`
      });
      return;
    }
  }

  cooldowns.set(cooldownKey, now + command.cooldown * 1000);
  if (cooldowns.size > 500) {
    for (const [key, expiry] of cooldowns) {
      if (expiry < now) cooldowns.delete(key);
    }
  }

  const ctx = {
    sock,
    msg: normalizedMessage.raw,
    normalized: normalizedMessage,
    args,
    prefix: config.botPrefix,
    config,
    command,
    permission
  };

  try {
    await command.execute(ctx);
    logger.debug(`Executed command: ${command.name} by ${userId}`);
  } catch (err) {
    logger.error(err, `Error executing command: ${command.name}`);
    await sock.sendMessage(normalizedMessage.remoteJid, {
      text: '⚔️ Command execution failed. Check logs.'
    });
  }
}

module.exports = {
  loadCommands,
  handleCommand
};
