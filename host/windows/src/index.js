#!/usr/bin/env node
'use strict';

const { registerProtocols } = require('./register-protocols');
const { tryBecomePrimary, sendToPrimary } = require('./single-instance');
const browser = require('./browser');
const compose = require('./compose');
const tray = require('./tray');
const {
  MESSAGES_URL,
  sanitizeMessagesUrl,
  ensurePipeToken,
  readPipeToken,
} = require('./config');
const log = require('./log');

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = { quit: false, protocolUrl: null, open: false, registerOnly: false };
  for (const a of args) {
    if (a === '--quit') out.quit = true;
    else if (a === '--open') out.open = true;
    else if (a === '--register-protocols') out.registerOnly = true;
    else if (/^(sms|tel|smsto|callto):/i.test(a)) out.protocolUrl = a;
  }
  return out;
}

let browserReady = Promise.resolve();

function authorizePipe(msg) {
  const expected = readPipeToken();
  if (!expected) return false;
  return msg && typeof msg.token === 'string' && msg.token === expected;
}

async function handleCommand(msg) {
  const type = msg && msg.type;
  if (!authorizePipe(msg)) {
    log.warn('Rejected unauthorized pipe command', { type });
    return { ok: false, error: 'unauthorized' };
  }
  log.info('Command', { type });
  if (type === 'quit') {
    setTimeout(() => shutdown(0), 100);
    return { ok: true };
  }
  if (type === 'signout') {
    await browser.clearProfile();
    // Stay in tray after sign-out; open only if user asks
    return { ok: true };
  }
  if (type === 'open' || type === 'ensure') {
    const url = sanitizeMessagesUrl(msg.url) || MESSAGES_URL;
    browserReady = browser.ensureBrowser(url);
    await browserReady;
    return { ok: true };
  }
  if (type === 'protocol' && msg.url) {
    browserReady = browser.ensureBrowser(MESSAGES_URL);
    await browserReady;
    const result = await compose.handleProtocolUrl(msg.url);
    return { ok: true, result };
  }
  return { ok: false, error: 'unknown command' };
}

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info('Shutting down host');
  try {
    tray.stopTray();
  } catch (_) {}
  try {
    browser.killBrowserProfileProcesses();
  } catch (_) {}
  process.exit(code);
}

async function main() {
  const opts = parseArgs(process.argv);
  log.info('Host start', { argv: process.argv.slice(2), pkg: !!process.pkg });

  try {
    // Debounced: skips PowerShell/SFTA when registration is already current
    registerProtocols({ force: opts.registerOnly });
  } catch (err) {
    log.error('Protocol registration failed', String(err));
  }

  if (opts.registerOnly) {
    process.exit(0);
  }

  if (opts.quit) {
    try {
      await sendToPrimary({ type: 'quit' });
    } catch (_) {
      browser.killBrowserProfileProcesses();
    }
    process.exit(0);
  }

  // Token must exist before primary listen / secondary connect
  ensurePipeToken();

  const primary = await tryBecomePrimary(handleCommand);
  if (!primary.primary) {
    const msg = opts.protocolUrl
      ? { type: 'protocol', url: opts.protocolUrl }
      : { type: 'open' };
    try {
      const res = await sendToPrimary(msg);
      log.info('Forwarded to primary', res);
    } catch (err) {
      log.error('Could not reach primary instance', String(err));
      process.exit(1);
    }
    process.exit(0);
  }

  // Quiet background host: tray only until a link / Open / --open
  tray.startTray();

  const shouldOpenUi = Boolean(opts.protocolUrl || opts.open);
  if (shouldOpenUi) {
    browserReady = browser.ensureBrowser(MESSAGES_URL).catch((err) => {
      log.error('Failed to start Messages UI', String(err));
    });
  } else {
    log.info('Running in tray (Messages UI opens on demand)');
  }

  if (opts.protocolUrl) {
    try {
      await handleCommand({
        type: 'protocol',
        url: opts.protocolUrl,
        token: readPipeToken(),
      });
    } catch (err) {
      log.error('Protocol handle failed', String(err));
    }
  }

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));
}

main().catch((err) => {
  log.error('Fatal', String(err && err.stack ? err.stack : err));
  process.exit(1);
});
