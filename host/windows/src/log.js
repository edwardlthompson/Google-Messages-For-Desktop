'use strict';

const fs = require('fs');
const { logPath } = require('./config');

function write(level, msg, extra) {
  const line = `${new Date().toISOString()} [${level}] ${msg}${
    extra !== undefined ? ` ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : ''
  }\n`;
  try {
    fs.appendFileSync(logPath(), line, 'utf8');
  } catch (_) {
    /* ignore */
  }
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[${level}] ${msg}`, extra !== undefined ? extra : '');
}

module.exports = {
  info: (m, e) => write('info', m, e),
  warn: (m, e) => write('warn', m, e),
  error: (m, e) => write('error', m, e),
  debug: (m, e) => write('debug', m, e),
};
