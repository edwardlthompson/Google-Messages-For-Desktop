'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const crypto = require('crypto');

const APP_NAME = 'Google Messages';
// ProgIds / registry app id must not contain spaces (Default Apps picker)
const APP_REG_NAME = 'GoogleMessages';
/** Install folder under %LOCALAPPDATA%\\Programs — no spaces (picker/path quirks). */
const INSTALL_DIR_NAME = 'GoogleMessages';
const PROG_ID_SMS = 'GoogleMessages.sms';
const PROG_ID_TEL = 'GoogleMessages.tel';
/** Packaged host filename — no spaces (Win11 Default Apps / OpenWithProgids). */
const HOST_EXE_NAME = 'GoogleMessages.exe';
/** Windows AppUserModelID — keeps taskbar pin separate from Chrome. */
const APP_USER_MODEL_ID = 'GoogleMessages.Desktop';
const MESSAGES_URL = 'https://messages.google.com/web/conversations';
const WELCOME_URL = 'https://messages.google.com/web/welcome';
/** Fallback only when no port file yet (tests / first allocate). */
const CDP_PORT_FALLBACK = 19222;
const PIPE_NAME = '\\\\.\\pipe\\GoogleMessagesHost';
const LOCK_NAME = 'GoogleMessagesHost.lock';
const PIPE_TOKEN_NAME = 'pipe.token';
const CDP_PORT_NAME = 'cdp-port.json';

/** Only Messages origins may be opened via pipe / ensureBrowser. */
function sanitizeMessagesUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:') return null;
    if (u.hostname.toLowerCase() !== 'messages.google.com') return null;
    return u.toString();
  } catch (_) {
    return null;
  }
}

function cdpPortPath() {
  return path.join(dataRoot(), CDP_PORT_NAME);
}

function getCdpPort() {
  try {
    const j = JSON.parse(fs.readFileSync(cdpPortPath(), 'utf8'));
    const p = Number(j && j.port);
    if (Number.isInteger(p) && p > 0 && p < 65536) return p;
  } catch (_) {
    /* ignore */
  }
  return CDP_PORT_FALLBACK;
}

function saveCdpPort(port) {
  fs.writeFileSync(
    cdpPortPath(),
    JSON.stringify({ port, at: new Date().toISOString() }, null, 2),
    'utf8',
  );
  return port;
}

function allocateCdpPort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const addr = s.address();
      const port = addr && addr.port;
      s.close(() => {
        if (!port) reject(new Error('no free CDP port'));
        else resolve(saveCdpPort(port));
      });
    });
    s.on('error', reject);
  });
}

function pipeTokenPath() {
  return path.join(dataRoot(), PIPE_TOKEN_NAME);
}

function ensurePipeToken() {
  const p = pipeTokenPath();
  try {
    const existing = fs.readFileSync(p, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch (_) {
    /* create */
  }
  const token = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(p, token, { encoding: 'utf8' });
  try {
    fs.chmodSync(p, 0o600);
  } catch (_) {
    /* Windows may ignore mode */
  }
  return token;
}

function readPipeToken() {
  try {
    const t = fs.readFileSync(pipeTokenPath(), 'utf8').trim();
    return t.length >= 32 ? t : null;
  } catch (_) {
    return null;
  }
}

/** Named pipe leaf name for .NET NamedPipeClientStream (no \\.\pipe\ prefix). */
function pipeLeafName() {
  const m = /\\pipe\\([^\\]+)$/i.exec(PIPE_NAME.replace(/\//g, '\\'));
  return (m && m[1]) || 'GoogleMessagesHost';
}

function installDir() {
  return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', INSTALL_DIR_NAME);
}

function dataRoot() {
  const root = path.join(process.env.LOCALAPPDATA || os.homedir(), 'GoogleMessages');
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function migrateLegacyProfile(dest) {
  // One-time copy from Nativefier Chrome-login profile if present and dest empty
  try {
    const roaming = process.env.APPDATA;
    if (!roaming) return;
    const entries = fs.readdirSync(roaming, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory() || !/^google-messages-nativefier-/i.test(ent.name)) continue;
      const legacy = path.join(roaming, ent.name, 'gmfd-browser-login');
      if (!fs.existsSync(path.join(legacy, 'Default'))) continue;
      const destHas = fs.existsSync(path.join(dest, 'Default'));
      if (destHas) return;
      fs.cpSync(legacy, dest, { recursive: true });
      break;
    }
  } catch (_) {
    /* ignore */
  }
}

function profileDir() {
  const dir = path.join(dataRoot(), 'chromium-profile');
  fs.mkdirSync(dir, { recursive: true });
  migrateLegacyProfile(dir);
  return dir;
}

function logPath() {
  return path.join(dataRoot(), 'gmfd-host.log');
}

function lockPath() {
  return path.join(dataRoot(), LOCK_NAME);
}

function findBuiltHostExe() {
  // Prefer no-space EXE for Default Apps / OpenWithProgids indexing
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', 'dist', 'Windows_Host', HOST_EXE_NAME),
    path.resolve(__dirname, '..', '..', '..', 'dist', 'Windows_Tray_Payload', HOST_EXE_NAME),
    path.join(installDir(), HOST_EXE_NAME),
    // Legacy spaced install folder
    path.join(process.env.LOCALAPPDATA || '', 'Programs', APP_NAME, HOST_EXE_NAME),
    path.resolve(__dirname, '..', '..', '..', 'dist', 'Windows_Host', 'Google Messages.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', APP_NAME, 'Google Messages.exe'),
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function hostExePath() {
  if (process.pkg) return process.execPath;
  const built = findBuiltHostExe();
  if (built) return built;
  return process.execPath;
}

function hostLaunchCommand() {
  const stable = path.join(installDir(), HOST_EXE_NAME);
  if (fs.existsSync(stable)) {
    return `"${stable}" "%1"`;
  }
  const exe = hostExePath();
  const base = path.basename(exe);
  if (/^node(\.exe)?$/i.test(base)) {
    throw new Error(
      `No ${HOST_EXE_NAME} found. Run npm run windows:host before --register-protocols.`,
    );
  }
  return `"${exe}" "%1"`;
}

module.exports = {
  APP_NAME,
  APP_REG_NAME,
  INSTALL_DIR_NAME,
  PROG_ID_SMS,
  PROG_ID_TEL,
  HOST_EXE_NAME,
  APP_USER_MODEL_ID,
  MESSAGES_URL,
  WELCOME_URL,
  /** @deprecated use getCdpPort() — kept for callers that read the last known port */
  get CDP_PORT() {
    return getCdpPort();
  },
  CDP_PORT_FALLBACK,
  PIPE_NAME,
  sanitizeMessagesUrl,
  getCdpPort,
  saveCdpPort,
  allocateCdpPort,
  ensurePipeToken,
  readPipeToken,
  pipeTokenPath,
  pipeLeafName,
  dataRoot,
  installDir,
  profileDir,
  logPath,
  lockPath,
  hostExePath,
  hostLaunchCommand,
  findBuiltHostExe,
};
