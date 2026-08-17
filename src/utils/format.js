const config = require('../config');

/**
 * SHXWN-KAGE formatting utilities.
 * Male anime / cyber-ninja aesthetic.
 */

// Standard header for bot-wide messages
function kageHeader() {
  return `╭━━━〔 ⚔️ ${config.botName} 〕━━━╮\n┃`;
}

// Standard footer
function kageFooter() {
  return `╰━━━━━━━━━━━━━━━━━━━━━━╯`;
}

// Wrap content in a KAGE box
function kageBox(content) {
  return `${kageHeader()}\n┃\n${content}\n┃\n${kageFooter()}`;
}

// A line inside a box, with label and value aligned
function styledLine(label, value) {
  const labelPart = label.padEnd(14, ' ');
  return `┃ ${labelPart}: ${value}`;
}

// Header for command-specific messages
function commandHeader(title) {
  return `╭━━〔 ⚔️ ${title.toUpperCase()} 〕━━╮\n┃`;
}

// Footer for command-specific messages
function commandFooter() {
  return `╰━━━━━━━━━━━━━━━━━━━━━╯`;
}

// Wrap command output in a styled box
function commandBox(title, lines) {
  return `${commandHeader(title)}\n${lines}\n${commandFooter()}`;
}

module.exports = {
  kageHeader,
  kageFooter,
  kageBox,
  styledLine,
  commandHeader,
  commandFooter,
  commandBox
};
